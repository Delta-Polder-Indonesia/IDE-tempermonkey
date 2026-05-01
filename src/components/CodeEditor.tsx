import { useRef, useCallback, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { UserScript, EditorSettings } from '../types';

const BOOKMARKS_KEY = 'tm-editor-bookmarks';

function loadBookmarks(): Record<string, number[]> {
  try {
    const stored = localStorage.getItem(BOOKMARKS_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return {};
}

function saveBookmarks(bookmarks: Record<string, number[]>) {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch { /* ignore */ }
}

interface CodeEditorProps {
  script: UserScript;
  settings: EditorSettings;
  onChange: (value: string) => void;
  editorRef: React.RefObject<any>;
}

export default function CodeEditor({ script, settings, onChange, editorRef }: CodeEditorProps) {
  const monacoRef = useRef<any>(null);
  const decorationIdsRef = useRef<string[]>([]);
  const [bookmarksMap, setBookmarksMap] = useState<Record<string, Set<number>>>(() => {
    const raw = loadBookmarks();
    const map: Record<string, Set<number>> = {};
    for (const [id, lines] of Object.entries(raw)) {
      map[id] = new Set(lines);
    }
    return map;
  });

  const getBookmarks = useCallback((scriptId: string): Set<number> => {
    return bookmarksMap[scriptId] || new Set();
  }, [bookmarksMap]);

  const toggleBookmark = useCallback((scriptId: string, line: number) => {
    setBookmarksMap(prev => {
      const next = { ...prev };
      const set = new Set(prev[scriptId] || []);
      if (set.has(line)) {
        set.delete(line);
      } else {
        set.add(line);
      }
      if (set.size === 0) {
        delete next[scriptId];
      } else {
        next[scriptId] = set;
      }
      // persist
      const raw: Record<string, number[]> = {};
      for (const [k, v] of Object.entries(next)) {
        raw[k] = Array.from(v);
      }
      saveBookmarks(raw);
      return next;
    });
  }, []);

  const toggleBookmarksRange = useCallback((scriptId: string, startLine: number, endLine: number) => {
    setBookmarksMap(prev => {
      const next = { ...prev };
      const set = new Set(prev[scriptId] || []);
      // Check if all lines in range are already bookmarked
      let allBookmarked = true;
      for (let i = startLine; i <= endLine; i++) {
        if (!set.has(i)) {
          allBookmarked = false;
          break;
        }
      }
      for (let i = startLine; i <= endLine; i++) {
        if (allBookmarked) {
          set.delete(i);
        } else {
          set.add(i);
        }
      }
      if (set.size === 0) {
        delete next[scriptId];
      } else {
        next[scriptId] = set;
      }
      const raw: Record<string, number[]> = {};
      for (const [k, v] of Object.entries(next)) {
        raw[k] = Array.from(v);
      }
      saveBookmarks(raw);
      return next;
    });
  }, []);

  const applyBookmarks = useCallback((editor: any, monaco: any, scriptId: string) => {
    const bookmarks = getBookmarks(scriptId);
    if (!editor.getModel()) return;

    const newDecorations: any[] = [];
    bookmarks.forEach(line => {
      newDecorations.push({
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: true,
          className: 'bookmark-line',
          linesDecorationsClassName: 'bookmark-gutter',
          glyphMarginClassName: 'bookmark-glyph',
          overviewRuler: {
            color: '#cca700',
            position: monaco.editor.OverviewRulerLane.Full,
          },
          minimap: {
            color: '#cca700',
            position: monaco.editor.MinimapPosition.Inline,
          },
        },
      });
    });

    decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, newDecorations);
  }, [getBookmarks]);

  const handleEditorDidMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Inject bookmark CSS
    const styleId = 'tm-bookmark-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .bookmark-line {
          background-color: rgba(204, 167, 0, 0.08) !important;
        }
        .bookmark-line .view-line span {
          background-color: transparent !important;
        }
        .bookmark-gutter {
          background-color: transparent !important;
        }
        .bookmark-gutter::before {
          content: '';
          position: absolute;
          left: 4px;
          top: 4px;
          bottom: 4px;
          width: 2px;
          background-color: #cca700;
          border-radius: 1px;
        }
        .bookmark-glyph {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .bookmark-glyph::before {
          content: '';
          width: 6px;
          height: 6px;
          background-color: #cca700;
          border-radius: 50%;
          display: block;
        }
      `;
      document.head.appendChild(style);
    }

    // Configure JavaScript language features
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      allowJs: true,
      typeRoots: ['node_modules/@types'],
    });

    // Add Tampermonkey API types
    const tampermonkeyTypes = `
      declare var unsafeWindow: Window;
      declare function GM_addStyle(css: string): HTMLStyleElement;
      declare function GM_deleteValue(name: string): void;
      declare function GM_getResourceText(name: string): string;
      declare function GM_getResourceURL(name: string): string;
      declare function GM_getTab(callback: (obj: any) => void): void;
      declare function GM_getTabs(callback: (obj: any) => void): void;
      declare var GM_info: {
        script: {
          name: string;
          namespace: string;
          version: string;
          description: string;
          author: string;
          matches: string[];
          includes: string[];
          excludes: string[];
          resources: any[];
          runAt: string;
          unwrap: boolean;
        };
        scriptMetaStr: string;
        scriptWillUpdate: boolean;
        version: string;
      };
      declare function GM_listValues(): string[];
      declare function GM_log(message: string): void;
      declare function GM_notification(details: {
        text?: string;
        title?: string;
        image?: string;
        highlight?: boolean;
        silent?: boolean;
        timeout?: number;
        onclick?: () => void;
        ondone?: () => void;
      }): void;
      declare function GM_openInTab(url: string, options?: { active?: boolean; insert?: boolean; setParent?: boolean }): { close: () => void; closed: boolean; onclose: (() => void) | null };
      declare function GM_registerMenuCommand(name: string, fn: () => void, accessKey?: string): number;
      declare function GM_saveTab(obj: any): void;
      declare function GM_setClipboard(data: string, type?: string): void;
      declare function GM_setValue(name: string, value: any): void;
      declare function GM_xmlhttpRequest(details: any): any;
      declare function GM_getValue(name: string, defaultValue?: any): any;
    `;

    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      tampermonkeyTypes,
      'ts:filename/tampermonkey.d.ts'
    );

    // Define custom theme matching Tampermonkey native editor
    monaco.editor.defineTheme('tampermonkey-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'comment.doc', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'keyword.flow', foreground: 'C586C0' },
        { token: 'keyword.js', foreground: '569CD6' },
        { token: 'identifier', foreground: '9CDCFE' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'string.escape', foreground: 'D7BA7D' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'number.hex', foreground: 'B5CEA8' },
        { token: 'regexp', foreground: 'D16969' },
        { token: 'operator', foreground: 'D4D4D4' },
        { token: 'delimiter', foreground: '#D4D4D4' },
        { token: 'delimiter.bracket', foreground: '#FFD700' },
        { token: 'tag', foreground: '569CD6' },
        { token: 'attribute.name', foreground: '9CDCFE' },
        { token: 'attribute.value', foreground: 'CE9178' },
        { token: 'function', foreground: 'DCDCAA' },
        { token: 'function.call', foreground: 'DCDCAA' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'variable', foreground: '9CDCFE' },
        { token: 'variable.predefined', foreground: '4FC1FF' },
        { token: 'variable.other.constant', foreground: '4FC1FF' },
        { token: 'property', foreground: '9CDCFE' },
        { token: 'property.readonly', foreground: '9CDCFE' },
        { token: 'constant', foreground: '4FC1FF' },
        { token: 'constant.language', foreground: '569CD6' },
        { token: 'constant.numeric', foreground: 'B5CEA8' },
        { token: 'meta.directive', foreground: '9CDCFE' },
        { token: 'meta.tag', foreground: '569CD6' },
        { token: 'storage.type', foreground: '569CD6' },
        { token: 'storage.modifier', foreground: '569CD6' },
        { token: 'support.function', foreground: 'DCDCAA' },
        { token: 'support.class', foreground: '4EC9B0' },
        { token: 'support.type', foreground: '4EC9B0' },
        { token: 'support.variable', foreground: '9CDCFE' },
        { token: 'support.constant', foreground: '4FC1FF' },
        { token: 'invalid', foreground: 'F44747' },
        { token: 'invalid.deprecated', foreground: 'F44747', fontStyle: 'underline' },
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editorLineNumber.foreground': '#5c5c5c',
        'editorLineNumber.activeForeground': '#c6c6c6',
        'editor.selectionBackground': '#264f78',
        'editor.selectionHighlightBackground': '#add6ff26',
        'editor.wordHighlightBackground': '#575757b8',
        'editor.wordHighlightStrongBackground': '#004972b8',
        'editor.findMatchBackground': '#515c6a',
        'editor.findMatchHighlightBackground': '#ea5c0055',
        'editor.hoverHighlightBackground': '#264f7840',
        'editor.lineHighlightBackground': '#2a2d2e',
        'editor.lineHighlightBorder': '#282828',
        'editorLink.activeForeground': '#4e94ce',
        'editor.rangeHighlightBackground': '#ffffff0b',
        'editorWhitespace.foreground': '#e3e4e229',
        'editorIndentGuide.background': '#404040',
        'editorIndentGuide.activeBackground': '#707070',
        'editorRuler.foreground': '#5a5a5a',
        'editorBracketMatch.background': '#0064001a',
        'editorBracketMatch.border': '#888888',
        'editorError.foreground': '#f48771',
        'editorWarning.foreground': '#cca700',
        'editorInfo.foreground': '#75beff',
        'editorHint.foreground': '#eeeeeeb3',
        'editorGutter.background': '#1e1e1e',
        'editorGutter.modifiedBackground': '#1b81a8',
        'editorGutter.addedBackground': '#487e02',
        'editorGutter.deletedBackground': '#f85149',
        'minimap.background': '#1e1e1e',
        'minimap.selectionHighlight': '#264f78',
        'minimap.errorHighlight': '#f48771',
        'minimap.warningHighlight': '#cca700',
        'editorOverviewRuler.border': '#1e1e1e',
        'editorOverviewRuler.findMatchForeground': '#d18616',
        'editorOverviewRuler.rangeHighlightForeground': '#d18616',
        'editorOverviewRuler.selectionHighlightForeground': '#a0a0a0cc',
        'editorOverviewRuler.wordHighlightForeground': '#a0a0a0cc',
        'editorOverviewRuler.wordHighlightStrongForeground': '#c0a0c0cc',
        'editorOverviewRuler.modifiedForeground': '#1b81a8',
        'editorOverviewRuler.addedForeground': '#487e02',
        'editorOverviewRuler.deletedForeground': '#f85149',
        'editorOverviewRuler.errorForeground': '#f48771',
        'editorOverviewRuler.warningForeground': '#cca700',
        'editorOverviewRuler.infoForeground': '#75beff',
      },
    });

    monaco.editor.setTheme('tampermonkey-dark');

    // Bookmark click handler on line numbers
    editor.onMouseDown((e: any) => {
      if (
        e.target.type === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS ||
        e.target.type === monaco.editor.MouseTargetType.GUTTER_LINE_DECORATIONS
      ) {
        // Prevent default to keep selection intact
        e.event.preventDefault();
        e.event.stopPropagation();

        const lineNumber = e.target.position?.lineNumber;
        if (!lineNumber) return;

        // Capture current selection BEFORE bookmark action
        const currentSelection = editor.getSelection();

        // If there's an active multi-line selection, bookmark the whole range
        if (currentSelection && !currentSelection.isEmpty()) {
          const startLine = Math.min(currentSelection.startLineNumber, currentSelection.endLineNumber);
          const endLine = Math.max(currentSelection.startLineNumber, currentSelection.endLineNumber);
          toggleBookmarksRange(script.id, startLine, endLine);
        } else {
          // Single line toggle
          toggleBookmark(script.id, lineNumber);
        }

        // Re-apply the selection so the block highlight stays visible
        // Use setTimeout to ensure Monaco doesn't override it asynchronously
        if (currentSelection) {
          setTimeout(() => {
            editor.setSelection(currentSelection);
            editor.revealRangeInCenterIfOutsideViewport(currentSelection);
          }, 0);
        }
      }
    });

    // Change cursor to pointer on line number gutter hover
    editor.onMouseMove((e: any) => {
      if (
        e.target.type === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS ||
        e.target.type === monaco.editor.MouseTargetType.GUTTER_LINE_DECORATIONS
      ) {
        editor.updateOptions({ cursorStyle: 'line' });
      }
    });

    // Apply initial bookmarks
    applyBookmarks(editor, monaco, script.id);
  }, [editorRef, script.id, toggleBookmark, toggleBookmarksRange, applyBookmarks]);

  // Re-apply bookmarks when they change or script changes
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (editor && monaco) {
      applyBookmarks(editor, monaco, script.id);
    }
  }, [bookmarksMap, script.id, editorRef, applyBookmarks]);

  const handleChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  }, [onChange]);

  return (
    <div className="flex-1 h-full bg-[#1e1e1e]">
      <Editor
        key={script.id}
        height="100%"
        defaultLanguage="javascript"
        value={script.code}
        theme={settings.theme === 'vs-dark' ? 'tampermonkey-dark' : settings.theme}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: settings.fontSize,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
          fontLigatures: true,
          wordWrap: settings.wordWrap,
          minimap: {
            enabled: settings.minimap,
            side: 'right',
            showSlider: 'mouseover',
          },
          lineNumbers: settings.lineNumbers,
          tabSize: settings.tabSize,
          insertSpaces: settings.insertSpaces,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          renderWhitespace: 'selection',
          bracketPairColorization: {
            enabled: true,
          },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          folding: true,
          foldingHighlight: true,
          unfoldOnClickAfterEndOfLine: true,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          formatOnPaste: true,
          formatOnType: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          quickSuggestionsDelay: 10,
          acceptSuggestionOnCommitCharacter: true,
          acceptSuggestionOnEnter: 'on',
          snippetSuggestions: 'inline',
          parameterHints: {
            enabled: true,
            cycle: true,
          },
          hover: {
            enabled: true,
            delay: 300,
          },
          links: true,
          colorDecorators: true,
          matchBrackets: 'always',
          autoIndent: 'full',
          dragAndDrop: true,
          multiCursorModifier: 'ctrlCmd',
          multiCursorMergeOverlapping: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 4,
          glyphMargin: true,
          renderLineHighlight: 'all',
          renderLineHighlightOnlyWhenFocus: true,
          padding: {
            top: 8,
            bottom: 8,
          },
        }}
      />
    </div>
  );
}
