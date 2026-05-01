import { useRef, useCallback, useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import {
  X,
  Save,
  FileCode2,
  Plus,
  Trash2,
  Copy,
  Power,
  PowerOff,
  Search,
  Settings,
  FileText,
  CheckCircle2,
  Clock,
  ChevronRight,
  LayoutList,
  Sparkles,
} from 'lucide-react';
import CodeEditor from './components/CodeEditor';
import MetadataEditor from './components/MetadataEditor';
import SettingsPanel from './components/SettingsPanel';
import AIChatPanel from './components/AIChatPanel';
import { useScripts } from './hooks/useScripts';
import { loadAISettings, saveAISettings } from './services/aiService';
import { AISettings } from './types';

function formatDate(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function MenuItem({ children, onClick, shortcut }: { children: React.ReactNode; onClick: () => void; shortcut?: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] text-[#cccccc] hover:bg-[#094771] hover:text-white transition-colors"
    >
      <span>{children}</span>
      {shortcut && <span className="text-[10px] text-[#858585] ml-4">{shortcut}</span>}
    </button>
  );
}

function MenuDivider() {
  return <div className="my-1 border-t border-[#454545]" />;
}

// Tampermonkey logo
function TmLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <circle cx="10.5" cy="16" r="8.5" fill="white" />
      <circle cx="21.5" cy="16" r="8.5" fill="white" opacity="0.55" />
    </svg>
  );
}

export default function App() {
  const editorRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showScriptPanel, setShowScriptPanel] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiSettings, setAISettingsState] = useState<AISettings>(loadAISettings);
  const [searchQuery, setSearchQueryLocal] = useState('');

  const {
    filteredScripts,
    activeScript,
    activeScriptId,
    settings,
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
  } = useScripts();

  const handleUpdateAISettings = useCallback((s: AISettings) => {
    setAISettingsState(s);
    saveAISettings(s);
  }, []);

  // Sync local search
  useEffect(() => {
    setSearchQuery(searchQuery);
  }, [searchQuery, setSearchQuery]);

  const handleSave = useCallback(() => {
    if (activeScript) {
      markSaved(activeScript.id);
      toast.success('Script saved!');
    }
  }, [activeScript, markSaved]);

  const handleInstall = useCallback(() => {
    setInstallModalOpen(true);
  }, []);

  const handleExport = useCallback(() => {
    if (activeScript) {
      exportScript(activeScript.id);
      toast.success(`Exported ${activeScript.name}.user.js`);
    }
  }, [activeScript, exportScript]);

  const handleBeautify = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
      toast.success('Code formatted!');
    }
  }, []);

  const handleApplyAICode = useCallback((code: string) => {
    if (activeScript && editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        model.setValue(code);
        updateScriptCode(activeScript.id, code);
        toast.success('Code applied from AI!');
      }
    }
  }, [activeScript, updateScriptCode]);

  const handleCollapseFunctions = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.foldLevel2')?.run();
      toast.success('Functions collapsed!');
    }
  }, []);

  const handleExpandAll = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.unfoldAll')?.run();
      toast.success('All expanded!');
    }
  }, []);

  const handleToggleMetadata = useCallback(() => {
    setShowMetadata((p) => !p);
    if (!showMetadata) setShowSettings(false);
  }, [showMetadata, setShowMetadata, setShowSettings]);

  const handleToggleSettings = useCallback(() => {
    setShowSettings((p) => !p);
    if (!showSettings) setShowMetadata(false);
  }, [showSettings, setShowSettings, setShowMetadata]);

  const handleUpdateScript = useCallback(
    (id: string, updates: any) => {
      updateScript(id, updates);
      toast.success('Metadata updated!');
    },
    [updateScript]
  );

  const handleCodeChange = useCallback(
    (value: string) => {
      if (activeScript) updateScriptCode(activeScript.id, value);
    },
    [activeScript, updateScriptCode]
  );

  const handleFind = () => editorRef.current?.getAction('actions.find')?.run();
  const handleReplace = () => editorRef.current?.getAction('editor.action.startFindReplaceAction:')?.run();
  const handleUndo = () => editorRef.current?.trigger('keyboard', 'undo', null);
  const handleRedo = () => editorRef.current?.trigger('keyboard', 'redo', null);
  const handleGotoLine = () => editorRef.current?.getAction('editor.action.gotoLine')?.run();
  const handleSelectAll = () => {
    const model = editorRef.current?.getModel();
    if (model) editorRef.current?.setSelection(model.getFullModelRange());
  };

  const menuItems = ['File', 'Edit', 'Selection', 'Find', 'GoTo', 'Developer'];

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't close if clicking inside menu bar area
      if (target.closest('[data-menu-bar]')) return;
      setActiveMenu(null);
    };
    if (activeMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [activeMenu]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1e1e] text-[#cccccc] overflow-hidden select-none font-sans">
      {/* ===== HEADER BAR ===== */}
      <div className="flex items-center justify-between h-[40px] bg-[#8B6914] text-white shrink-0 px-4">
        <div className="flex items-center gap-2.5">
          <TmLogo />
          <div className="flex items-baseline gap-1">
            <span className="text-[15px] font-bold tracking-tight">Tampermonkey</span>
            <span className="text-[10px] opacity-60 relative -top-0.5">®</span>
            <span className="text-[11px] opacity-50 ml-1">by Jan Biniok</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {[
            { label: 'Edit', active: true },
            { label: 'Installed Scripts', active: false },
            { label: 'Settings', active: false },
            { label: 'Utilities', active: false },
            { label: 'Help', active: false },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.label === 'Settings') setShowSettings(true);
                if (item.label === 'Installed Scripts') setShowScriptPanel(true);
              }}
              className={`px-3 py-1 rounded-md text-[12px] transition-colors ${
                item.active
                  ? 'bg-black/20 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== TAB BAR ===== */}
      <div className="flex items-center justify-between h-[34px] bg-[#2d2d2d] border-b border-[#111] shrink-0">
        <div className="flex items-center h-full">
          {activeScript && (
            <div className="flex items-center h-full px-4 bg-[#1e1e1e] text-[12px] text-[#cccccc] border-r border-[#111] gap-2">
              <FileCode2 className="w-3.5 h-3.5 text-[#8B6914]" />
              <span className="font-medium">
                {activeScript.name}
                {unsavedChanges[activeScript.id] && <span className="ml-1 text-[#cca700]">*</span>}
              </span>
              <button
                onClick={() => {
                  if (unsavedChanges[activeScript.id]) {
                    if (!confirm('Discard changes?')) return;
                  }
                  setActiveScriptId('');
                }}
                className="ml-2 p-0.5 rounded hover:bg-[#333] text-[#666] hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <button 
            onClick={addScript}
            className="px-3 h-full flex items-center justify-center text-[#888] hover:text-white hover:bg-[#333] border-r border-[#111]"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 px-2">
          {activeScript && (
            <>
              <button
                onClick={handleSave}
                disabled={!unsavedChanges[activeScript.id]}
                className={`px-3 py-1 rounded text-[11px] font-medium transition-colors ${
                  unsavedChanges[activeScript.id]
                    ? 'bg-[#8B6914] text-white hover:bg-[#7a5c12]'
                    : 'bg-[#333] text-[#666] cursor-default'
                }`}
              >
                Save
              </button>
              <button
                onClick={() => setActiveScriptId('')}
                className="px-3 py-1 rounded text-[11px] font-medium text-[#ccc] bg-[#444] hover:bg-[#555] transition-colors"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>

      {/* ===== MAIN LAYOUT ===== */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Icon Sidebar */}
        <div className="w-[48px] flex-shrink-0 flex flex-col items-center bg-[#333333] border-r border-[#111] py-3 gap-2">
          <button
            onClick={() => setShowScriptPanel(!showScriptPanel)}
            className={`w-[36px] h-[36px] rounded flex items-center justify-center transition-all ${
              showScriptPanel ? 'bg-[#1e1e1e] text-[#8B6914] shadow-inner' : 'text-[#aaa] hover:bg-[#3d3d3d] hover:text-white'
            }`}
            title="Installed Scripts"
          >
            <LayoutList className="w-5 h-5" />
          </button>
          <button
            onClick={addScript}
            className="w-[36px] h-[36px] rounded flex items-center justify-center text-[#aaa] hover:bg-[#3d3d3d] hover:text-white transition-all"
            title="New Script"
          >
            <Plus className="w-5 h-5" />
          </button>
          <div className="w-8 h-[1px] bg-[#444] my-1" />
          <button
            onClick={handleToggleMetadata}
            className={`w-[36px] h-[36px] rounded flex items-center justify-center transition-all ${
              showMetadata ? 'bg-[#1e1e1e] text-[#8B6914] shadow-inner' : 'text-[#aaa] hover:bg-[#3d3d3d] hover:text-white'
            }`}
            title="Metadata"
          >
            <FileText className="w-5 h-5" />
          </button>
          <button
            onClick={handleToggleSettings}
            className={`w-[36px] h-[36px] rounded flex items-center justify-center transition-all ${
              showSettings ? 'bg-[#1e1e1e] text-[#8B6914] shadow-inner' : 'text-[#aaa] hover:bg-[#3d3d3d] hover:text-white'
            }`}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <button
            onClick={() => {
              setShowAIChat(!showAIChat);
              if (!showAIChat) {
                setShowSettings(false);
                setShowMetadata(false);
              }
            }}
            className={`w-[36px] h-[36px] rounded flex items-center justify-center transition-all mb-4 ${
              showAIChat ? 'bg-[#1e1e1e] text-[#cca700] shadow-inner' : 'text-[#aaa] hover:bg-[#3d3d3d] hover:text-[#cca700]'
            }`}
            title="AI Assistant"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </div>

        {/* Script Panel (overlay when open) */}
        <AnimatePresence>
          {showScriptPanel && (
            <div
              className="absolute left-[42px] top-[68px] bottom-[22px] w-[280px] z-40 bg-[#252526] border-r border-[#1a1a1a] flex flex-col shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-[#333]">
                <span className="text-[12px] font-semibold text-[#cccccc]">Installed Scripts</span>
                <button
                  onClick={() => setShowScriptPanel(false)}
                  className="p-1 rounded hover:bg-[#3c3c3c] text-[#858585] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="px-2.5 py-2 border-b border-[#333]">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#555]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQueryLocal(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-7 pr-2 py-1 text-[11px] bg-[#1e1e1e] border border-[#3c3c3c] rounded text-[#cccccc] placeholder-[#555] focus:outline-none focus:border-[#8B6914]"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredScripts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-[#555]">
                    <FileCode2 className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-[11px]">No scripts</p>
                  </div>
                ) : (
                  filteredScripts.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setActiveScriptId(s.id);
                        setShowMetadata(false);
                        setShowSettings(false);
                      }}
                      className={`group flex items-center gap-2 px-2.5 py-2 cursor-pointer border-b border-[#2a2a2a] transition-colors ${
                        activeScriptId === s.id ? 'bg-[#37373d]' : 'hover:bg-[#2a2a2a]'
                      }`}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleScript(s.id); }}
                        className={`flex-shrink-0 transition-colors ${
                          s.enabled ? 'text-green-500' : 'text-[#555] hover:text-[#888]'
                        }`}
                      >
                        {s.enabled ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className={`text-[11px] truncate ${s.enabled ? 'text-[#cccccc]' : 'text-[#666]'}`}>
                            {s.name}
                          </span>
                          {unsavedChanges[s.id] && (
                            <span className="flex-shrink-0 w-1 h-1 rounded-full bg-[#cca700]" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5 text-[#444]" />
                          <span className="text-[9px] text-[#444]">{formatDate(s.updatedAt)}</span>
                          <span className="text-[9px] text-[#444]">v{s.metadata.version}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); duplicateScript(s.id); }}
                          className="p-1 rounded hover:bg-[#3a3a3a] text-[#555] hover:text-[#ccc]"
                        >
                          <Copy className="w-2.5 h-2.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteScript(s.id); }}
                          className="p-1 rounded hover:bg-red-900/20 text-[#555] hover:text-red-400"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      {activeScriptId === s.id && (
                        <ChevronRight className="w-3 h-3 text-[#8B6914] flex-shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="px-2.5 py-1.5 border-t border-[#333] text-[10px] text-[#555]">
                {filteredScripts.length} script{filteredScripts.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
          {/* Menu Bar */}
          <div data-menu-bar className="flex items-center h-[28px] bg-[#1e1e1e] border-b border-[#333] shrink-0 px-2 gap-0.5">
            {menuItems.map((menu) => (
              <div key={menu} className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(activeMenu === menu ? null : menu);
                  }}
                  className={`px-3 py-1 text-[12px] transition-colors rounded-sm ${
                    activeMenu === menu
                      ? 'bg-[#094771] text-white'
                      : 'text-[#bbb] hover:bg-[#333] hover:text-white'
                  }`}
                >
                  {menu}
                </button>
                {activeMenu === menu && (
                  <div
                    className="absolute top-full left-0 z-50 min-w-[200px] bg-[#252526] border border-[#454545] shadow-2xl py-1 mt-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {menu === 'File' && (
                      <>
                        <MenuItem onClick={() => { addScript(); setActiveMenu(null); }}>New Script</MenuItem>
                        <MenuItem onClick={() => { fileInputRef.current?.click(); setActiveMenu(null); }}>Import...</MenuItem>
                        {activeScript && (
                          <>
                            <MenuDivider />
                            <MenuItem onClick={() => { handleSave(); setActiveMenu(null); }} shortcut="Ctrl+S">Save</MenuItem>
                            <MenuItem onClick={() => { handleExport(); setActiveMenu(null); }}>Export as .user.js</MenuItem>
                          </>
                        )}
                      </>
                    )}
                    {menu === 'Edit' && (
                      <>
                        <MenuItem onClick={() => { handleUndo(); setActiveMenu(null); }} shortcut="Ctrl+Z">Undo</MenuItem>
                        <MenuItem onClick={() => { handleRedo(); setActiveMenu(null); }} shortcut="Ctrl+Y">Redo</MenuItem>
                        <MenuDivider />
                        <MenuItem onClick={() => { handleBeautify(); setActiveMenu(null); }}>Format Document</MenuItem>
                      </>
                    )}
                    {menu === 'Find' && (
                      <>
                        <MenuItem onClick={() => { handleFind(); setActiveMenu(null); }} shortcut="Ctrl+F">Find</MenuItem>
                        <MenuItem onClick={() => { handleReplace(); setActiveMenu(null); }} shortcut="Ctrl+H">Replace</MenuItem>
                      </>
                    )}
                    {menu === 'Selection' && (
                      <MenuItem onClick={() => { handleSelectAll(); setActiveMenu(null); }} shortcut="Ctrl+A">Select All</MenuItem>
                    )}
                    {menu === 'Developer' && (
                      <>
                        <MenuItem onClick={() => { handleCollapseFunctions(); setActiveMenu(null); }}>Collapse Functions</MenuItem>
                        <MenuItem onClick={() => { handleExpandAll(); setActiveMenu(null); }}>Expand All</MenuItem>
                      </>
                    )}
                    {menu === 'GoTo' && (
                      <MenuItem onClick={() => { handleGotoLine(); setActiveMenu(null); }} shortcut="Ctrl+G">Go to Line...</MenuItem>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div className="flex-1" />

            {/* Right buttons */}
            <div className="flex items-center gap-0.5 px-2">
              <button
                onClick={handleSave}
                disabled={!activeScript || !unsavedChanges[activeScript?.id || '']}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] transition-colors ${
                  activeScript && unsavedChanges[activeScript.id]
                    ? 'text-[#cca700] hover:bg-[#3c3c3c]'
                    : 'text-green-600 cursor-default'
                }`}
              >
                {activeScript && unsavedChanges[activeScript.id] ? <Save className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                {activeScript && unsavedChanges[activeScript.id] ? 'Save' : 'Saved'}
              </button>
              <button
                onClick={handleInstall}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-[#cccccc] hover:bg-[#3c3c3c] transition-colors"
              >
                <Power className="w-3 h-3" />
                Install
              </button>
            </div>
          </div>

          {/* Editor + Panels */}
          <div className="flex flex-1 overflow-hidden">
            {activeScript ? (
              <div className="flex-1 flex flex-col min-w-0">
                <CodeEditor
                  script={activeScript}
                  settings={settings}
                  onChange={handleCodeChange}
                  editorRef={editorRef}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[#555]">
                <FileCode2 className="w-14 h-14 mb-3 opacity-20" />
                <p className="text-[13px]">Select a script to edit</p>
                <button
                  onClick={addScript}
                  className="mt-3 px-4 py-1.5 rounded bg-[#8B6914] text-white text-[12px] hover:bg-[#7a5c12] transition-colors"
                >
                  Create New Script
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              {showMetadata && activeScript && (
                <MetadataEditor
                  key="metadata"
                  script={activeScript}
                  onUpdate={handleUpdateScript}
                  onClose={() => setShowMetadata(false)}
                />
              )}
              {showSettings && (
                <SettingsPanel
                  key="settings"
                  settings={settings}
                  onUpdate={setSettings}
                  onClose={() => setShowSettings(false)}
                />
              )}
              {showAIChat && activeScript && (
                <AIChatPanel
                  key="ai-chat"
                  settings={aiSettings}
                  onUpdateSettings={handleUpdateAISettings}
                  scriptName={activeScript.name}
                  scriptCode={activeScript.code}
                  onClose={() => setShowAIChat(false)}
                  onApplyCode={handleApplyAICode}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 h-[26px] bg-[#0d0d0d] border-t border-[#1a1a1a] text-[#666] text-[11px] shrink-0">
        <div className="flex items-center gap-5">
          {activeScript && (
            <>
              <span className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${activeScript.enabled ? 'bg-green-500' : 'bg-[#444]'}`} />
                <span className={activeScript.enabled ? 'text-[#999]' : 'text-[#555]'}>
                  {activeScript.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </span>
              <span className="text-[#555]">{activeScript.metadata.match.length} match{activeScript.metadata.match.length !== 1 ? 'es' : ''}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-6">
          {activeScript && (
            <>
              <span className="hover:text-[#999] cursor-default transition-colors">JavaScript</span>
              <span className="hover:text-[#999] cursor-default transition-colors">UTF-8</span>
              <span className="hover:text-[#999] cursor-default transition-colors">Tab Size: {settings.tabSize}</span>
              <span className="text-[#888]">Ln {activeScript.code.split('\n').length}, Col 1</span>
            </>
          )}
        </div>
      </div>

      {/* Install Modal */}
      {installModalOpen && activeScript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[#252526] border border-[#454545] rounded shadow-2xl w-[480px] max-w-[90vw]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#333]">
              <h3 className="text-[13px] font-semibold text-[#cccccc]">Install Script</h3>
              <button onClick={() => setInstallModalOpen(false)} className="text-[#858585] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-4 py-3 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded bg-[#1e1e1e] flex items-center justify-center flex-shrink-0">
                  <FileCode2 className="w-5 h-5 text-[#8B6914]" />
                </div>
                <div>
                  <p className="text-[12px] font-medium text-[#cccccc]">{activeScript.name}</p>
                  <p className="text-[11px] text-[#858585] mt-0.5">{activeScript.metadata.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e1e1e] text-[#858585]">v{activeScript.metadata.version}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e1e1e] text-[#858585]">{activeScript.metadata.author || 'Unknown'}</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#1e1e1e] rounded p-2.5 space-y-1">
                <p className="text-[10px] font-medium text-[#858585]">This script will run on:</p>
                {activeScript.metadata.match.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-[#cccccc]">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                    {m}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[#333]">
              <button onClick={() => setInstallModalOpen(false)} className="px-3 py-1 rounded text-[11px] text-[#cccccc] hover:bg-[#3c3c3c]">Cancel</button>
              <button onClick={() => { setInstallModalOpen(false); toast.success(`${activeScript.name} installed!`); }} className="px-3 py-1 rounded text-[11px] bg-green-700 text-white hover:bg-green-800">Install</button>
            </div>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept=".js,.user.js" onChange={(e) => { const f = e.target.files?.[0]; if (f) importScript(f); e.target.value = ''; }} className="hidden" />

      <Toaster position="bottom-right" toastOptions={{ style: { background: '#252526', color: '#cccccc', border: '1px solid #454545' } }} />
    </div>
  );
}
