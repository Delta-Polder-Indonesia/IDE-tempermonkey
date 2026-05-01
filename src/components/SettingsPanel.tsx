import { motion } from 'framer-motion';
import { X, Type, Palette, WrapText, Eye, Hash, Indent } from 'lucide-react';
import { EditorSettings } from '../types';

interface SettingsPanelProps {
  settings: EditorSettings;
  onUpdate: (settings: Partial<EditorSettings>) => void;
  onClose: () => void;
}

export default function SettingsPanel({ settings, onUpdate, onClose }: SettingsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="w-[320px] flex-shrink-0 bg-[#1e1e1e] border-l border-[#333] flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#333]">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#8B6914]" />
          <span className="text-[13px] font-semibold text-[#cccccc]">Editor Settings</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-[#3c3c3c] text-[#858585] hover:text-[#cccccc] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Theme */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-[#858585]" />
            <span className="text-[11px] text-[#858585] font-medium">Theme</span>
          </div>
          <select
            value={settings.theme}
            onChange={(e) => onUpdate({ theme: e.target.value as any })}
            className="w-full px-2.5 py-1.5 text-[12px] bg-[#1e1e1e] border border-[#3c3c3c] rounded text-[#cccccc] focus:outline-none focus:border-[#8B6914] transition-colors"
          >
            <option value="vs-dark">Dark</option>
            <option value="vs-light">Light</option>
            <option value="hc-black">High Contrast</option>
          </select>
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Type className="w-3.5 h-3.5 text-[#858585]" />
            <span className="text-[11px] text-[#858585] font-medium">Font Size</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={10}
              max={24}
              value={settings.fontSize}
              onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
              className="flex-1 h-1.5 bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#8B6914]"
            />
            <span className="text-[11px] text-[#858585] w-8 text-right">{settings.fontSize}px</span>
          </div>
        </div>

        {/* Word Wrap */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <WrapText className="w-3.5 h-3.5 text-[#858585]" />
            <span className="text-[11px] text-[#858585] font-medium">Word Wrap</span>
          </div>
          <select
            value={settings.wordWrap}
            onChange={(e) => onUpdate({ wordWrap: e.target.value as any })}
            className="w-full px-2.5 py-1.5 text-[12px] bg-[#1e1e1e] border border-[#3c3c3c] rounded text-[#cccccc] focus:outline-none focus:border-[#8B6914] transition-colors"
          >
            <option value="on">On</option>
            <option value="off">Off</option>
            <option value="wordWrapColumn">Column</option>
            <option value="bounded">Bounded</option>
          </select>
        </div>

        {/* Line Numbers */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Hash className="w-3.5 h-3.5 text-[#858585]" />
            <span className="text-[11px] text-[#858585] font-medium">Line Numbers</span>
          </div>
          <select
            value={settings.lineNumbers}
            onChange={(e) => onUpdate({ lineNumbers: e.target.value as any })}
            className="w-full px-2.5 py-1.5 text-[12px] bg-[#1e1e1e] border border-[#3c3c3c] rounded text-[#cccccc] focus:outline-none focus:border-[#8B6914] transition-colors"
          >
            <option value="on">On</option>
            <option value="off">Off</option>
            <option value="relative">Relative</option>
            <option value="interval">Interval</option>
          </select>
        </div>

        {/* Tab Size */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Indent className="w-3.5 h-3.5 text-[#858585]" />
            <span className="text-[11px] text-[#858585] font-medium">Tab Size</span>
          </div>
          <div className="flex items-center gap-2">
            {[2, 4, 8].map((size) => (
              <button
                key={size}
                onClick={() => onUpdate({ tabSize: size })}
                className={`px-3 py-1 rounded text-[11px] transition-colors ${
                  settings.tabSize === size
                    ? 'bg-[#8B6914]/20 text-[#cca700]'
                    : 'bg-[#1e1e1e] text-[#858585] hover:bg-[#2a2a2a]'
                }`}
              >
                {size} spaces
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-[#858585]" />
            <span className="text-[11px] text-[#858585] font-medium">Display</span>
          </div>

          <label className="flex items-center justify-between cursor-pointer py-1">
            <span className="text-[11px] text-[#858585]">Minimap</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.minimap}
                onChange={(e) => onUpdate({ minimap: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8B6914]" />
            </div>
          </label>

          <label className="flex items-center justify-between cursor-pointer py-1">
            <span className="text-[11px] text-[#858585]">Insert Spaces</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.insertSpaces}
                onChange={(e) => onUpdate({ insertSpaces: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8B6914]" />
            </div>
          </label>
        </div>
      </div>
    </motion.div>
  );
}
