import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Plus,
  Trash2,
  Globe,
  User,
  FileText,
  Tag,
  Link,
  Shield,
  Clock,
  Image,
  Ban,
  Copyright,
} from 'lucide-react';
import { UserScript, ScriptMetadata } from '../types';

interface MetadataEditorProps {
  script: UserScript;
  onUpdate: (id: string, updates: Partial<UserScript>) => void;
  onClose: () => void;
}

const runAtOptions = [
  'document-start',
  'document-body',
  'document-end',
  'document-idle',
  'context-menu',
];

const grantOptions = [
  'none',
  'GM_addStyle',
  'GM_deleteValue',
  'GM_getResourceText',
  'GM_getResourceURL',
  'GM_getTab',
  'GM_getTabs',
  'GM_info',
  'GM_listValues',
  'GM_log',
  'GM_notification',
  'GM_openInTab',
  'GM_registerMenuCommand',
  'GM_saveTab',
  'GM_setClipboard',
  'GM_setValue',
  'GM_xmlhttpRequest',
  'unsafeWindow',
  'window.close',
  'window.focus',
  'window.onurlchange',
];

export default function MetadataEditor({ script, onUpdate, onClose }: MetadataEditorProps) {
  const [metadata, setMetadata] = useState<ScriptMetadata>(script.metadata);

  useEffect(() => {
    setMetadata(script.metadata);
  }, [script.id]);

  const updateField = (field: keyof ScriptMetadata, value: any) => {
    const newMetadata = { ...metadata, [field]: value };
    setMetadata(newMetadata);
  };

  const updateArrayField = (field: 'match' | 'include' | 'exclude' | 'grant', index: number, value: string) => {
    const newArray = [...metadata[field]];
    newArray[index] = value;
    updateField(field, newArray);
  };

  const addArrayItem = (field: 'match' | 'include' | 'exclude' | 'grant') => {
    updateField(field, [...metadata[field], '']);
  };

  const removeArrayItem = (field: 'match' | 'include' | 'exclude' | 'grant', index: number) => {
    const newArray = metadata[field].filter((_, i) => i !== index);
    updateField(field, newArray);
  };

  const handleSave = () => {
    // Update metadata block in code
    const metaBlock = buildMetadataBlock(metadata);
    const codeWithoutMeta = script.code.replace(/\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==/, '').trim();
    const newCode = metaBlock + '\n\n' + codeWithoutMeta;

    onUpdate(script.id, {
      metadata,
      name: metadata.name,
      code: newCode,
    });
    onClose();
  };

  const buildMetadataBlock = (m: ScriptMetadata): string => {
    const lines = ['// ==UserScript=='];
    lines.push(`// @name         ${m.name}`);
    if (m.namespace) lines.push(`// @namespace    ${m.namespace}`);
    lines.push(`// @version      ${m.version}`);
    if (m.description) lines.push(`// @description   ${m.description}`);
    if (m.author) lines.push(`// @author       ${m.author}`);
    m.match.forEach(v => { if (v) lines.push(`// @match        ${v}`); });
    m.include.forEach(v => { if (v) lines.push(`// @include      ${v}`); });
    m.exclude.forEach(v => { if (v) lines.push(`// @exclude      ${v}`); });
    m.grant.forEach(v => { if (v) lines.push(`// @grant        ${v}`); });
    if (m.runAt) lines.push(`// @run-at       ${m.runAt}`);
    if (m.icon) lines.push(`// @icon         ${m.icon}`);
    if (m.updateURL) lines.push(`// @updateURL    ${m.updateURL}`);
    if (m.downloadURL) lines.push(`// @downloadURL  ${m.downloadURL}`);
    if (m.supportURL) lines.push(`// @supportURL    ${m.supportURL}`);
    if (m.homepageURL) lines.push(`// @homepageURL  ${m.homepageURL}`);
    if (m.license) lines.push(`// @license      ${m.license}`);
    if (m.noframes) lines.push('// @noframes');
    lines.push('// ==/UserScript==');
    return lines.join('\n');
  };

  const InputField = ({
    icon: Icon,
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
  }: {
    icon: React.ElementType;
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
  }) => (
    <div className="flex items-start gap-2">
      <div className="flex items-center gap-2 w-28 flex-shrink-0 mt-2">
        <Icon className="w-3.5 h-3.5 text-[#858585]" />
        <span className="text-xs text-[#858585]">{label}</span>
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-2.5 py-1.5 text-[12px] bg-[#1e1e1e] border border-[#3c3c3c] rounded text-[#cccccc] placeholder-[#555] focus:outline-none focus:border-[#8B6914] transition-colors"
      />
    </div>
  );

  const ArrayField = ({
    icon: Icon,
    label,
    field,
    values,
    placeholder,
    options,
  }: {
    icon: React.ElementType;
    label: string;
    field: 'match' | 'include' | 'exclude' | 'grant';
    values: string[];
    placeholder?: string;
    options?: string[];
  }) => (
    <div className="flex items-start gap-2">
      <div className="flex items-center gap-2 w-28 flex-shrink-0 mt-2">
        <Icon className="w-3.5 h-3.5 text-[#858585]" />
        <span className="text-xs text-[#858585]">{label}</span>
      </div>
      <div className="flex-1 space-y-1.5">
        {values.map((value, index) => (
          <div key={index} className="flex items-center gap-1.5">
            {options ? (
              <select
                value={value}
                onChange={(e) => updateArrayField(field, index, e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-[12px] bg-[#1e1e1e] border border-[#3c3c3c] rounded text-[#cccccc] focus:outline-none focus:border-[#8B6914] transition-colors"
              >
                {options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) => updateArrayField(field, index, e.target.value)}
                placeholder={placeholder}
                className="flex-1 px-2.5 py-1.5 text-[12px] bg-[#1e1e1e] border border-[#3c3c3c] rounded text-[#cccccc] placeholder-[#555] focus:outline-none focus:border-[#8B6914] transition-colors"
              />
            )}
            <button
              onClick={() => removeArrayItem(field, index)}
              className="p-1.5 rounded hover:bg-red-900/20 text-[#858585] hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button
          onClick={() => addArrayItem(field)}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[#4a9eff] hover:bg-[#4a9eff]/10 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add {label}
        </button>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="w-[380px] flex-shrink-0 bg-[#1e1e1e] border-l border-[#333] flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#333]">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#8B6914]" />
          <span className="text-[13px] font-semibold text-[#cccccc]">Script Metadata</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-[#3c3c3c] text-[#858585] hover:text-[#cccccc] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <InputField
          icon={Tag}
          label="Name"
          value={metadata.name}
          onChange={(v) => updateField('name', v)}
          placeholder="Script name"
        />

        <InputField
          icon={Globe}
          label="Namespace"
          value={metadata.namespace}
          onChange={(v) => updateField('namespace', v)}
          placeholder="http://example.com/"
        />

        <InputField
          icon={Tag}
          label="Version"
          value={metadata.version}
          onChange={(v) => updateField('version', v)}
          placeholder="1.0.0"
        />

        <InputField
          icon={FileText}
          label="Description"
          value={metadata.description}
          onChange={(v) => updateField('description', v)}
          placeholder="What does this script do?"
        />

        <InputField
          icon={User}
          label="Author"
          value={metadata.author}
          onChange={(v) => updateField('author', v)}
          placeholder="Your name"
        />

        <ArrayField
          icon={Globe}
          label="Match"
          field="match"
          values={metadata.match}
          placeholder="https://example.com/*"
        />

        <ArrayField
          icon={Globe}
          label="Include"
          field="include"
          values={metadata.include}
          placeholder="*://*.example.com/*"
        />

        <ArrayField
          icon={Ban}
          label="Exclude"
          field="exclude"
          values={metadata.exclude}
          placeholder="*://*.example.com/login"
        />

        <ArrayField
          icon={Shield}
          label="Grant"
          field="grant"
          values={metadata.grant}
          options={grantOptions}
        />

        <div className="flex items-start gap-2">
          <div className="flex items-center gap-2 w-28 flex-shrink-0 mt-2">
            <Clock className="w-3.5 h-3.5 text-[#858585]" />
            <span className="text-xs text-[#858585]">Run At</span>
          </div>
          <select
            value={metadata.runAt}
            onChange={(e) => updateField('runAt', e.target.value)}
            className="flex-1 px-2.5 py-1.5 text-[12px] bg-[#1e1e1e] border border-[#3c3c3c] rounded text-[#cccccc] focus:outline-none focus:border-[#8B6914] transition-colors"
          >
            {runAtOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <InputField
          icon={Image}
          label="Icon URL"
          value={metadata.icon}
          onChange={(v) => updateField('icon', v)}
          placeholder="https://example.com/icon.png"
        />

        <InputField
          icon={Link}
          label="Update URL"
          value={metadata.updateURL}
          onChange={(v) => updateField('updateURL', v)}
          placeholder="https://example.com/script.user.js"
        />

        <InputField
          icon={Link}
          label="Download URL"
          value={metadata.downloadURL}
          onChange={(v) => updateField('downloadURL', v)}
          placeholder="https://example.com/script.user.js"
        />

        <InputField
          icon={Link}
          label="Support URL"
          value={metadata.supportURL}
          onChange={(v) => updateField('supportURL', v)}
          placeholder="https://example.com/support"
        />

        <InputField
          icon={Link}
          label="Homepage"
          value={metadata.homepageURL}
          onChange={(v) => updateField('homepageURL', v)}
          placeholder="https://example.com"
        />

        <InputField
          icon={Copyright}
          label="License"
          value={metadata.license}
          onChange={(v) => updateField('license', v)}
          placeholder="MIT"
        />

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 w-28 flex-shrink-0">
            <Ban className="w-3.5 h-3.5 text-[#858585]" />
            <span className="text-xs text-[#858585]">No Frames</span>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={metadata.noframes}
              onChange={(e) => updateField('noframes', e.target.checked)}
              className="w-4 h-4 rounded border-[#3c3c3c] bg-[#1e1e1e] text-[#8B6914] focus:ring-[#8B6914] focus:ring-offset-0"
            />
            <span className="text-xs text-[#858585]">Prevent running in iframes</span>
          </label>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[#333]">
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded text-[11px] text-[#858585] hover:bg-[#3c3c3c] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1.5 rounded text-[11px] bg-[#8B6914] text-white hover:bg-[#7a5c12] transition-colors"
        >
          Save Metadata
        </button>
      </div>
    </motion.div>
  );
}
