export interface ScriptMetadata {
  name: string;
  namespace: string;
  version: string;
  description: string;
  author: string;
  match: string[];
  include: string[];
  exclude: string[];
  grant: string[];
  runAt: string;
  icon: string;
  updateURL: string;
  downloadURL: string;
  supportURL: string;
  homepageURL: string;
  license: string;
  noframes: boolean;
}

export interface UserScript {
  id: string;
  name: string;
  enabled: boolean;
  code: string;
  metadata: ScriptMetadata;
  createdAt: number;
  updatedAt: number;
}

export interface EditorSettings {
  theme: 'vs-dark' | 'vs-light' | 'hc-black';
  fontSize: number;
  wordWrap: 'on' | 'off' | 'wordWrapColumn' | 'bounded';
  minimap: boolean;
  lineNumbers: 'on' | 'off' | 'relative' | 'interval';
  tabSize: number;
  insertSpaces: boolean;
}

export interface AISettings {
  apiKey: string;
  model: string;
  provider: 'openai' | 'openrouter';
  enabled: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
