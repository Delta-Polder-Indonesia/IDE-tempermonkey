import { useState, useCallback, useEffect } from 'react';
import { UserScript, EditorSettings } from '../types';
import { sampleScripts, createNewScript } from '../data/defaultScripts';

const STORAGE_KEY = 'tm-editor-scripts';
const SETTINGS_KEY = 'tm-editor-settings';

function loadScripts(): UserScript[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return sampleScripts;
}

function saveScripts(scripts: UserScript[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scripts));
  } catch {
    // ignore
  }
}

const defaultSettings: EditorSettings = {
  theme: 'vs-dark',
  fontSize: 14,
  wordWrap: 'on',
  minimap: true,
  lineNumbers: 'on',
  tabSize: 2,
  insertSpaces: true,
};

function loadSettings(): EditorSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch {
    // ignore
  }
  return defaultSettings;
}

function saveSettings(settings: EditorSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function useScripts() {
  const [scripts, setScripts] = useState<UserScript[]>(loadScripts);
  const [activeScriptId, setActiveScriptId] = useState<string>(scripts[0]?.id || '');
  const [settings, setSettingsState] = useState<EditorSettings>(loadSettings);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState<Record<string, boolean>>({});

  useEffect(() => {
    saveScripts(scripts);
  }, [scripts]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const activeScript = scripts.find(s => s.id === activeScriptId) || null;

  const filteredScripts = scripts.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.metadata.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addScript = useCallback(() => {
    const newScript = createNewScript();
    setScripts(prev => [newScript, ...prev]);
    setActiveScriptId(newScript.id);
    setShowMetadata(false);
  }, []);

  const deleteScript = useCallback((id: string) => {
    setScripts(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (activeScriptId === id && filtered.length > 0) {
        setActiveScriptId(filtered[0].id);
      }
      return filtered;
    });
    setUnsavedChanges(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, [activeScriptId]);

  const updateScript = useCallback((id: string, updates: Partial<UserScript>) => {
    setScripts(prev =>
      prev.map(s =>
        s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s
      )
    );
  }, []);

  const updateScriptCode = useCallback((id: string, code: string) => {
    setScripts(prev =>
      prev.map(s =>
        s.id === id ? { ...s, code, updatedAt: Date.now() } : s
      )
    );
    setUnsavedChanges(prev => ({ ...prev, [id]: true }));
  }, []);

  const toggleScript = useCallback((id: string) => {
    setScripts(prev =>
      prev.map(s =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    );
  }, []);

  const duplicateScript = useCallback((id: string) => {
    const script = scripts.find(s => s.id === id);
    if (!script) return;
    const newScript: UserScript = {
      ...script,
      id: 'script-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9),
      name: script.name + ' (Copy)',
      metadata: { ...script.metadata, name: script.metadata.name + ' (Copy)' },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setScripts(prev => [newScript, ...prev]);
    setActiveScriptId(newScript.id);
  }, [scripts]);

  const exportScript = useCallback((id: string) => {
    const script = scripts.find(s => s.id === id);
    if (!script) return;
    const blob = new Blob([script.code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.user.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [scripts]);

  const importScript = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const code = e.target?.result as string;
      if (!code) return;
      
      // Parse metadata
      const metaMatch = code.match(/\/\/ ==UserScript==([\s\S]*?)\/\/ ==\/UserScript==/);
      let name = file.name.replace('.user.js', '');
      let description = '';
      let author = '';
      let version = '1.0';
      let namespace = 'http://tampermonkey.net/';
      let match: string[] = [];
      let include: string[] = [];
      let exclude: string[] = [];
      let grant: string[] = [];
      let runAt = 'document-end';
      let icon = '';

      if (metaMatch) {
        const metaBlock = metaMatch[1];
        const extract = (key: string): string => {
          const m = metaBlock.match(new RegExp(`// @${key}\\s+(.+)`));
          return m ? m[1].trim() : '';
        };
        const extractAll = (key: string): string[] => {
          const matches: string[] = [];
          const regex = new RegExp(`// @${key}\\s+(.+)`, 'g');
          let m;
          while ((m = regex.exec(metaBlock)) !== null) {
            matches.push(m[1].trim());
          }
          return matches;
        };

        name = extract('name') || name;
        description = extract('description') || description;
        author = extract('author') || author;
        version = extract('version') || version;
        namespace = extract('namespace') || namespace;
        match = extractAll('match');
        include = extractAll('include');
        exclude = extractAll('exclude');
        grant = extractAll('grant');
        runAt = extract('run-at') || extract('runAt') || runAt;
        icon = extract('icon') || icon;
      }

      const newScript: UserScript = {
        id: 'script-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9),
        name,
        enabled: true,
        code,
        metadata: {
          name,
          namespace,
          version,
          description,
          author,
          match,
          include,
          exclude,
          grant: grant.length > 0 ? grant : ['none'],
          runAt,
          icon,
          updateURL: '',
          downloadURL: '',
          supportURL: '',
          homepageURL: '',
          license: '',
          noframes: false,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setScripts(prev => [newScript, ...prev]);
      setActiveScriptId(newScript.id);
    };
    reader.readAsText(file);
  }, []);

  const markSaved = useCallback((id: string) => {
    setUnsavedChanges(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const setSettings = useCallback((updates: Partial<EditorSettings>) => {
    setSettingsState(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    scripts,
    filteredScripts,
    activeScript,
    activeScriptId,
    settings,
    searchQuery,
    showSettings,
    showMetadata,
    unsavedChanges,
    setActiveScriptId,
    setSearchQuery,
    setShowSettings,
    setShowMetadata,
    addScript,
    deleteScript,
    updateScript,
    updateScriptCode,
    toggleScript,
    duplicateScript,
    exportScript,
    importScript,
    markSaved,
    setSettings,
  };
}
