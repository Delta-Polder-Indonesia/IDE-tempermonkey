import {
  Save,
  Play,
  Download,
  Settings,
  FileText,
  Undo,
  Redo,
  Search,
  Replace,
  Wrench,
  CheckCircle2,
  ChevronsDownUp,
  ChevronsUpDown,
} from 'lucide-react';
import { UserScript } from '../types';

interface ToolbarProps {
  activeScript: UserScript | null;
  showMetadata: boolean;
  showSettings: boolean;
  unsaved: boolean;
  onSave: () => void;
  onInstall: () => void;
  onExport: () => void;
  onToggleMetadata: () => void;
  onToggleSettings: () => void;
  onBeautify: () => void;
  onCollapseFunctions: () => void;
  onExpandAll: () => void;
  editorRef: React.RefObject<any>;
}

export default function Toolbar({
  activeScript,
  showMetadata,
  showSettings,
  unsaved,
  onSave,
  onInstall,
  onExport,
  onToggleMetadata,
  onToggleSettings,
  onBeautify,
  onCollapseFunctions,
  onExpandAll,
  editorRef,
}: ToolbarProps) {
  const handleFind = () => {
    editorRef.current?.getAction('actions.find')?.run();
  };

  const handleReplace = () => {
    editorRef.current?.getAction('editor.action.startFindReplaceAction:')?.run();
  };

  const handleUndo = () => {
    editorRef.current?.trigger('keyboard', 'undo', null);
  };

  const handleRedo = () => {
    editorRef.current?.trigger('keyboard', 'redo', null);
  };

  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-[#252526] border-b border-[#333]">
      <div className="flex items-center gap-0.5">
        {/* File Actions */}
        <button
          onClick={onSave}
          disabled={!unsaved}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
            unsaved
              ? 'bg-[#4a9eff]/20 text-[#4a9eff] hover:bg-[#4a9eff]/30'
              : 'text-green-500 cursor-default'
          }`}
          title="Save (Ctrl+S)"
        >
          {unsaved ? <Save className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          {unsaved ? 'Save' : 'Saved'}
        </button>

        <div className="w-px h-5 bg-[#333] mx-1" />

        <button
          onClick={onInstall}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs text-gray-300 hover:bg-[#3a3a3a] transition-colors"
          title="Install Script"
        >
          <Play className="w-3.5 h-3.5" />
          Install
        </button>

        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs text-gray-300 hover:bg-[#3a3a3a] transition-colors"
          title="Export as .user.js"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </button>

        <div className="w-px h-5 bg-[#333] mx-1" />

        <button
          onClick={handleUndo}
          className="p-1.5 rounded text-gray-400 hover:bg-[#3a3a3a] hover:text-gray-200 transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleRedo}
          className="p-1.5 rounded text-gray-400 hover:bg-[#3a3a3a] hover:text-gray-200 transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-5 bg-[#333] mx-1" />

        <button
          onClick={handleFind}
          className="p-1.5 rounded text-gray-400 hover:bg-[#3a3a3a] hover:text-gray-200 transition-colors"
          title="Find (Ctrl+F)"
        >
          <Search className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleReplace}
          className="p-1.5 rounded text-gray-400 hover:bg-[#3a3a3a] hover:text-gray-200 transition-colors"
          title="Replace (Ctrl+H)"
        >
          <Replace className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onBeautify}
          className="p-1.5 rounded text-gray-400 hover:bg-[#3a3a3a] hover:text-gray-200 transition-colors"
          title="Format Code"
        >
          <Wrench className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-5 bg-[#333] mx-1" />

        <button
          onClick={onCollapseFunctions}
          className="p-1.5 rounded text-gray-400 hover:bg-[#3a3a3a] hover:text-gray-200 transition-colors"
          title="Collapse All Functions (keep outer function open)"
        >
          <ChevronsDownUp className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onExpandAll}
          className="p-1.5 rounded text-gray-400 hover:bg-[#3a3a3a] hover:text-gray-200 transition-colors"
          title="Expand All"
        >
          <ChevronsUpDown className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-0.5">
        {activeScript && (
          <div className="flex items-center gap-2 mr-3">
            <span className="text-xs text-gray-500 truncate max-w-[200px]">
              {activeScript.name}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#333] text-gray-400">
              v{activeScript.metadata.version}
            </span>
          </div>
        )}

        <button
          onClick={onToggleMetadata}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
            showMetadata
              ? 'bg-[#4a9eff]/20 text-[#4a9eff]'
              : 'text-gray-400 hover:bg-[#3a3a3a] hover:text-gray-200'
          }`}
          title="Edit Metadata"
        >
          <FileText className="w-3.5 h-3.5" />
          Metadata
        </button>

        <button
          onClick={onToggleSettings}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
            showSettings
              ? 'bg-[#4a9eff]/20 text-[#4a9eff]'
              : 'text-gray-400 hover:bg-[#3a3a3a] hover:text-gray-200'
          }`}
          title="Editor Settings"
        >
          <Settings className="w-3.5 h-3.5" />
          Settings
        </button>
      </div>
    </div>
  );
}
