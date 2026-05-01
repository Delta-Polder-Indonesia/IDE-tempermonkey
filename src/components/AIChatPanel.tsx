import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  X,
  Bot,
  User,
  Key,
  Loader2,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  Wand2,
  Bug,
  Lightbulb,
  Code2,
  Plus,
  Mic,
  ChevronDown,
  Sparkles,
  History as HistoryIcon,
  Paperclip,
  Image as ImageIcon,
  FileUp,
} from 'lucide-react';
import { ChatMessage, AISettings } from '../types';
import { streamAIResponse, loadChatHistory, saveChatHistory } from '../services/aiService';
import ReactMarkdown from 'react-markdown';

interface AIChatPanelProps {
  settings: AISettings;
  onUpdateSettings: (settings: AISettings) => void;
  scriptName: string;
  scriptCode: string;
  onClose: () => void;
  onApplyCode?: (code: string) => void;
}

function generateId() {
  return 'msg-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
}

interface LocalAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  isImage: boolean;
  textSnippet?: string;
}

export default function AIChatPanel({
  settings,
  onUpdateSettings,
  scriptName,
  scriptCode,
  onClose,
  onApplyCode,
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChatHistory());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [localKey, setLocalKey] = useState(settings.apiKey);
  const [localModel, setLocalModel] = useState(settings.model);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showPlanningMenu, setShowPlanningMenu] = useState(false);
  const [attachments, setAttachments] = useState<LocalAttachment[]>([]);
  const [modelDropdownPos, setModelDropdownPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 220 });
  const [planningMenuPos, setPlanningMenuPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 220 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const modelButtonRef = useRef<HTMLButtonElement>(null);
  const modelPopupRef = useRef<HTMLDivElement>(null);
  const planningButtonRef = useRef<HTMLButtonElement>(null);
  const planningPopupRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    if (!settings.apiKey) {
      setShowSettings(true);
      setError('Please configure your API key first');
      return;
    }

    const attachmentSummary = attachments.length
      ? `\n\n[ATTACHMENTS]\n${attachments
          .map((a) => `- ${a.name} (${a.type || 'file'}, ${(a.size / 1024).toFixed(1)} KB)`) 
          .join('\n')}${attachments
          .filter((a) => a.textSnippet)
          .map((a) => `\n\nContent snippet from ${a.name}:\n\`\`\`\n${a.textSnippet}\n\`\`\``)
          .join('')}`
      : '';

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: input.trim() + attachmentSummary,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachments([]);
    setIsLoading(true);
    setError(null);

    const apiMessages = messages.slice(-10).concat(userMsg).map(m => ({
      role: m.role,
      content: m.content,
    }));

    const assistantMsg: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const stream = streamAIResponse(apiMessages, settings, {
        name: scriptName,
        code: scriptCode,
      });

      for await (const chunk of stream) {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsg.id
              ? { ...m, content: m.content + chunk }
              : m
          )
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get response');
      setMessages(prev => prev.filter(m => m.id !== assistantMsg.id));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, settings, messages, scriptName, scriptCode, attachments]);

  const openPlanningMenu = useCallback(() => {
    if (!planningButtonRef.current) return;
    const rect = planningButtonRef.current.getBoundingClientRect();
    setPlanningMenuPos({
      top: Math.max(12, rect.top - 8),
      left: Math.max(12, rect.left),
      width: 240,
    });
    setShowPlanningMenu(true);
  }, []);

  const handleFileSelection = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const selected = Array.from(files).slice(0, 6);
    const parsed: LocalAttachment[] = await Promise.all(
      selected.map(async (file) => {
        const isImage = file.type.startsWith('image/');
        let textSnippet: string | undefined;

        const isTextLike =
          file.type.startsWith('text/') ||
          /\.(txt|md|json|js|ts|tsx|jsx|css|html|csv)$/i.test(file.name);

        if (isTextLike && file.size <= 40 * 1024) {
          textSnippet = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || '').slice(0, 2000));
            reader.onerror = () => resolve('');
            reader.readAsText(file);
          });
        }

        return {
          id: generateId(),
          name: file.name,
          type: file.type,
          size: file.size,
          isImage,
          textSnippet,
        };
      })
    );

    setAttachments((prev) => [...prev, ...parsed].slice(0, 8));
    setShowPlanningMenu(false);
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleQuickAction = useCallback((action: string) => {
    const prompts: Record<string, string> = {
      debug: 'Please analyze this script and find any bugs, errors, or potential issues. Explain what each problem is and how to fix it.',
      optimize: 'Please optimize this script for better performance, cleaner code, and best practices. Show me the improved version with explanations.',
      explain: 'Please explain what this script does, step by step. Break down the logic and explain any complex parts.',
      improve: 'Please suggest improvements to this script. Consider: code quality, performance, security, and maintainability.',
    };
    setInput(prompts[action] || '');
    inputRef.current?.focus();
  }, []);

  const handleCopy = useCallback((id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleClear = useCallback(() => {
    if (confirm('Clear all chat history?')) {
      setMessages([]);
      saveChatHistory([]);
    }
  }, []);

  const handleSaveSettings = useCallback(() => {
    onUpdateSettings({ ...settings, apiKey: localKey, model: localModel });
    setShowSettings(false);
    setError(null);
  }, [localKey, localModel, settings, onUpdateSettings]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const openModelDropdown = useCallback(() => {
    if (!modelButtonRef.current) return;
    const rect = modelButtonRef.current.getBoundingClientRect();
    const popupWidth = Math.max(260, rect.width + 40);
    const preferredTop = rect.top - 8;
    setModelDropdownPos({
      top: Math.max(12, preferredTop),
      left: Math.max(12, rect.left),
      width: popupWidth,
    });
    setShowModelDropdown(true);
  }, []);

  useEffect(() => {
    if (!showModelDropdown && !showPlanningMenu) return;

    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (modelButtonRef.current?.contains(target)) return;
      if (planningButtonRef.current?.contains(target)) return;
      if (modelPopupRef.current?.contains(target)) return;
      if (planningPopupRef.current?.contains(target)) return;
      setShowModelDropdown(false);
      setShowPlanningMenu(false);
    };

    const handleReposition = () => {
      if (showModelDropdown && modelButtonRef.current) {
        const rect = modelButtonRef.current.getBoundingClientRect();
        setModelDropdownPos((prev) => ({
          ...prev,
          top: Math.max(12, rect.top - 8),
          left: Math.max(12, rect.left),
        }));
      }
      if (showPlanningMenu && planningButtonRef.current) {
        const rect = planningButtonRef.current.getBoundingClientRect();
        setPlanningMenuPos((prev) => ({
          ...prev,
          top: Math.max(12, rect.top - 8),
          left: Math.max(12, rect.left),
        }));
      }
    };

    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [showModelDropdown, showPlanningMenu]);

  const modelDisplayNames: Record<string, string> = {
    'gpt-5.4-codex': 'GPT 5.4 CODEX',
    'gemini-pro': 'GEMINI PRO',
    'gemini-medium': 'GEMINI MEDIUM',
    'gemini-flash': 'GEMINI FLASH',
    'claude-opus': 'CLAUDE OPUS',
    'claude-sonnet': 'CLAUDE SONNET',
    'claude-haiku': 'CLAUDE HAIKU',
    'gpt-4o': 'GPT-4o (Smart)',
    'gpt-4o-mini': 'GPT-4o Mini (Fast)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="w-[420px] flex-shrink-0 bg-[#0d0d0d] border-l border-[#222] flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-[42px] border-b border-[#222] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-semibold text-[#e0e0e0] tracking-wide">AI Assistant</span>
          {settings.apiKey && (
            <span className="flex items-center gap-1 text-[10px] text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">
              <span className="w-1 h-1 rounded-full bg-green-500" />
              Online
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded-md text-[#666] hover:text-[#ccc] hover:bg-[#1a1a1a] transition-colors"
            title="Settings"
          >
            <Key className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleClear}
            className="p-1.5 rounded-md text-[#666] hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#666] hover:text-[#ccc] hover:bg-[#1a1a1a] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-4 py-4 border-b border-[#222] space-y-4 bg-[#111]">
          <div>
            <label className="text-[11px] text-[#666] uppercase tracking-wider font-medium block mb-2">API Key</label>
            <input
              type="password"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder={settings.provider === 'openai' ? 'OpenAI key (sk-...)' : 'OpenRouter key (sk-or-...)'}
              className="w-full px-3 py-2 text-[12px] bg-[#0d0d0d] border border-[#333] rounded-md text-[#ccc] placeholder-[#444] focus:outline-none focus:border-[#555] transition-colors"
            />
            <p className="text-[9px] text-[#444] mt-1.5">Stored locally in your browser. Never sent to any server.</p>
          </div>
          <div>
            <label className="text-[11px] text-[#666] uppercase tracking-wider font-medium block mb-2">Provider</label>
            <select
              value={settings.provider}
              onChange={(e) => onUpdateSettings({ ...settings, provider: e.target.value as 'openai' | 'openrouter' })}
              className="w-full px-3 py-2 text-[12px] bg-[#0d0d0d] border border-[#333] rounded-md text-[#ccc] focus:outline-none focus:border-[#555] transition-colors"
            >
              <option value="openai">OpenAI</option>
              <option value="openrouter">OpenRouter (Gemini/Claude/Opus)</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-[#666] uppercase tracking-wider font-medium block mb-2">Model</label>
            <select
              value={localModel}
              onChange={(e) => setLocalModel(e.target.value)}
              className="w-full px-3 py-2 text-[12px] bg-[#0d0d0d] border border-[#333] rounded-md text-[#ccc] focus:outline-none focus:border-[#555] transition-colors"
            >
              {Object.entries(modelDisplayNames).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => setShowSettings(false)}
              className="px-3 py-1.5 rounded-md text-[11px] text-[#888] hover:text-[#ccc] hover:bg-[#1a1a1a] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
              className="px-3 py-1.5 rounded-md text-[11px] bg-[#e0e0e0] text-[#111] hover:bg-white font-medium transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !showSettings && (
          <div className="flex flex-col h-full">
            {/* Welcome */}
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-[#888]" />
              </div>
              <h3 className="text-[15px] font-semibold text-[#ccc] mb-1">AI Assistant</h3>
              <p className="text-[12px] text-[#555] text-center max-w-[280px] leading-relaxed">
                Ask me anything about your userscript. I can debug, optimize, explain, or improve your code.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickAction('debug')}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#151515] border border-[#222] text-[11px] text-[#999] hover:border-[#444] hover:text-[#ccc] transition-all text-left"
              >
                <Bug className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                Debug Script
              </button>
              <button
                onClick={() => handleQuickAction('optimize')}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#151515] border border-[#222] text-[11px] text-[#999] hover:border-[#444] hover:text-[#ccc] transition-all text-left"
              >
                <Wand2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                Optimize
              </button>
              <button
                onClick={() => handleQuickAction('explain')}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#151515] border border-[#222] text-[11px] text-[#999] hover:border-[#444] hover:text-[#ccc] transition-all text-left"
              >
                <Lightbulb className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                Explain Code
              </button>
              <button
                onClick={() => handleQuickAction('improve')}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#151515] border border-[#222] text-[11px] text-[#999] hover:border-[#444] hover:text-[#ccc] transition-all text-left"
              >
                <Code2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                Improve Code
              </button>
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div className="px-4 py-4 space-y-5">
            {messages.map((msg) => (
              <div key={msg.id} className="group">
                {/* Avatar & Name row */}
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    msg.role === 'user' ? 'bg-[#2a2a2a]' : 'bg-[#1a1a1a]'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="w-2.5 h-2.5 text-[#888]" />
                    ) : (
                      <Bot className="w-2.5 h-2.5 text-[#888]" />
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-[#888]">
                    {msg.role === 'user' ? 'You' : 'Assistant'}
                  </span>
                  <span className="text-[9px] text-[#444]">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Message content */}
                <div className="pl-7">
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            const code = String(children).replace(/\n$/, '');
                            if (!inline && match) {
                              return (
                                <div className="my-3 rounded-lg overflow-hidden border border-[#2a2a2a]">
                                  <div className="flex items-center justify-between px-3 py-1.5 bg-[#151515] border-b border-[#2a2a2a]">
                                    <span className="text-[10px] text-[#666] font-mono">{match[1]}</span>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleCopy(msg.id + '-code', code)}
                                        className="p-1 rounded hover:bg-[#2a2a2a] text-[#555] hover:text-[#ccc] transition-colors"
                                        title="Copy"
                                      >
                                        {copiedId === msg.id + '-code' ? (
                                          <Check className="w-3 h-3 text-green-500" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </button>
                                      {onApplyCode && (
                                        <button
                                          onClick={() => onApplyCode(code)}
                                          className="px-2 py-0.5 rounded text-[10px] bg-[#2a2a2a] text-[#ccc] hover:bg-[#3a3a3a] hover:text-white transition-colors font-medium"
                                        >
                                          Apply
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <pre className="!m-0 !bg-[#0d0d0d] !p-3 overflow-x-auto">
                                    <code className="text-[11px] font-mono leading-relaxed" {...props}>
                                      {children}
                                    </code>
                                  </pre>
                                </div>
                              );
                            }
                            return (
                              <code className="bg-[#1a1a1a] px-1.5 py-0.5 rounded text-[11px] font-mono text-[#ce9178] border border-[#2a2a2a]" {...props}>
                                {children}
                              </code>
                            );
                          },
                          p({ children }) {
                            return <p className="text-[12px] text-[#bbb] leading-relaxed mb-2">{children}</p>;
                          },
                          ul({ children }) {
                            return <ul className="text-[12px] text-[#bbb] leading-relaxed mb-2 space-y-1">{children}</ul>;
                          },
                          ol({ children }) {
                            return <ol className="text-[12px] text-[#bbb] leading-relaxed mb-2 space-y-1">{children}</ol>;
                          },
                          li({ children }) {
                            return <li className="text-[12px] text-[#bbb]">{children}</li>;
                          },
                          h1({ children }) {
                            return <h1 className="text-[14px] font-semibold text-[#ccc] mb-2 mt-4">{children}</h1>;
                          },
                          h2({ children }) {
                            return <h2 className="text-[13px] font-semibold text-[#ccc] mb-2 mt-3">{children}</h2>;
                          },
                          h3({ children }) {
                            return <h3 className="text-[12px] font-semibold text-[#ccc] mb-1.5 mt-2">{children}</h3>;
                          },
                          strong({ children }) {
                            return <strong className="text-[#ddd] font-semibold">{children}</strong>;
                          },
                        }}
                      >
                        {msg.content || '...'}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-[12px] text-[#ccc] leading-relaxed">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex items-center gap-2 pl-7">
                <div className="w-5 h-5 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                  <Bot className="w-2.5 h-2.5 text-[#666]" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 text-[#555] animate-spin" />
                  <span className="text-[11px] text-[#555]">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-3 px-3 py-2.5 bg-red-500/5 border border-red-500/20 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-red-300 leading-relaxed">{error}</p>
        </div>
      )}

      {/* Input Area (100% Mirroring Gravity IDE) */}
      <div className="px-3 pb-3 pt-2 shrink-0 bg-[#0d0d0d]">
        <div className="relative bg-[#161616] border border-[#262626] rounded-xl overflow-hidden focus-within:border-[#404040] transition-all shadow-2xl">
          {/* Top toolbar inside input */}
          <div className="flex items-center gap-1 px-2 pt-2 pb-1">
            <button className="p-1 text-[#555] hover:text-[#888] transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 text-[#555] hover:text-[#888] transition-colors">
              <HistoryIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyDown={handleKeyDown}
            placeholder={settings.apiKey ? 'Ask anything, @ to mention, / for workflows' : 'Please configure API key...'}
            disabled={isLoading}
            className="w-full px-4 py-1.5 text-[13px] bg-transparent text-[#e0e0e0] placeholder-[#555] focus:outline-none resize-none min-h-[44px] max-h-[300px] disabled:opacity-50 leading-relaxed font-sans"
          />

          {attachments.length > 0 && (
            <div className="px-3 pb-1 flex flex-wrap gap-1.5">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#1d1d1d] border border-[#2e2e2e] text-[10px] text-[#a0a0a0]"
                >
                  {attachment.isImage ? (
                    <ImageIcon className="w-3 h-3 text-[#8ab4f8]" />
                  ) : (
                    <Paperclip className="w-3 h-3 text-[#888]" />
                  )}
                  <span className="max-w-[140px] truncate">{attachment.name}</span>
                  <button
                    onClick={() => removeAttachment(attachment.id)}
                    className="text-[#666] hover:text-[#ccc] transition-colors"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Bottom toolbar (Status & Actions) */}
          <div className="flex items-center justify-between px-2 pb-2 pt-1 mt-1">
            <div className="flex items-center gap-1.5">
              <button
                ref={planningButtonRef}
                onClick={() => {
                  if (showPlanningMenu) {
                    setShowPlanningMenu(false);
                  } else {
                    openPlanningMenu();
                  }
                }}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-[#555] hover:text-[#aaa] transition-colors"
              >
                <Plus className="w-3 h-3" />
                Planning
              </button>
              
              <div className="relative">
                <button
                  ref={modelButtonRef}
                  onClick={() => {
                    if (showModelDropdown) {
                      setShowModelDropdown(false);
                    } else {
                      openModelDropdown();
                    }
                  }}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-[#555] hover:text-[#aaa] transition-colors bg-[#1a1a1a] border border-[#222]"
                >
                  <Sparkles className="w-3 h-3 text-amber-500/70" />
                  {modelDisplayNames[settings.model] || settings.model}
                  <ChevronDown className="w-2.5 h-2.5 opacity-50" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button className="p-1 text-[#555] hover:text-[#aaa] transition-colors">
                <Mic className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || !settings.apiKey}
                className="p-1 rounded-md bg-[#2a2a2a] text-[#aaa] hover:bg-[#3a3a3a] hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModelDropdown &&
        createPortal(
          <div
            ref={modelPopupRef}
            className="fixed z-[120] bg-[#131313] border border-[#2b2b2b] rounded-xl shadow-2xl py-1"
            style={{
              top: modelDropdownPos.top,
              left: modelDropdownPos.left,
              width: modelDropdownPos.width,
              transform: 'translateY(-100%)',
            }}
          >
            <div className="px-3 py-1.5 text-[9px] text-[#4a4a4a] font-bold uppercase tracking-widest">AI Agent Models</div>
            {Object.entries(modelDisplayNames).map(([value, label]) => (
              <button
                key={value}
                onClick={() => {
                  const provider =
                    value === 'gpt-4o' || value === 'gpt-4o-mini' ? 'openai' : 'openrouter';
                  onUpdateSettings({ ...settings, model: value, provider });
                  setShowModelDropdown(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors flex items-center justify-between ${
                  settings.model === value ? 'text-[#f0f0f0] bg-[#222]' : 'text-[#8a8a8a] hover:text-[#ddd] hover:bg-[#1c1c1c]'
                }`}
              >
                {label}
                {settings.model === value && <Check className="w-3 h-3 text-amber-500" />}
              </button>
            ))}
          </div>,
          document.body
        )}

      {showPlanningMenu &&
        createPortal(
          <div
            ref={planningPopupRef}
            className="fixed z-[121] bg-[#131313] border border-[#2b2b2b] rounded-xl shadow-2xl py-1"
            style={{
              top: planningMenuPos.top,
              left: planningMenuPos.left,
              width: planningMenuPos.width,
              transform: 'translateY(-100%)',
            }}
          >
            <div className="px-3 py-1.5 text-[9px] text-[#4a4a4a] font-bold uppercase tracking-widest">Planning Tools</div>
            <button
              onClick={() => imageInputRef.current?.click()}
              className="w-full text-left px-3 py-1.5 text-[11px] transition-colors flex items-center gap-2 text-[#8a8a8a] hover:text-[#ddd] hover:bg-[#1c1c1c]"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#8ab4f8]" />
              Upload Photo
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full text-left px-3 py-1.5 text-[11px] transition-colors flex items-center gap-2 text-[#8a8a8a] hover:text-[#ddd] hover:bg-[#1c1c1c]"
            >
              <FileUp className="w-3.5 h-3.5 text-[#fbbc04]" />
              Upload Files
            </button>
          </div>,
          document.body
        )}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFileSelection(e.target.files);
          e.target.value = '';
        }}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.json,.js,.ts,.tsx,.jsx,.css,.html,.csv,.pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFileSelection(e.target.files);
          e.target.value = '';
        }}
      />
    </motion.div>
  );
}
