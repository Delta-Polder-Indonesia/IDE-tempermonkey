import { AISettings, ChatMessage } from '../types';

const AI_SETTINGS_KEY = 'tm-editor-ai-settings';
const AI_HISTORY_KEY = 'tm-editor-ai-history';

const defaultSettings: AISettings = {
  apiKey: '',
  model: 'gpt-4o-mini',
  provider: 'openai',
  enabled: false,
};

const modelRegistry: Record<string, { provider: 'openai' | 'openrouter'; model: string }> = {
  'gpt-5.4-codex': { provider: 'openrouter', model: 'openai/gpt-4o' },
  'gemini-pro': { provider: 'openrouter', model: 'google/gemini-pro-1.5' },
  'gemini-medium': { provider: 'openrouter', model: 'google/gemini-2.0-flash-lite-001' },
  'gemini-flash': { provider: 'openrouter', model: 'google/gemini-2.0-flash-001' },
  'claude-opus': { provider: 'openrouter', model: 'anthropic/claude-3-opus' },
  'claude-sonnet': { provider: 'openrouter', model: 'anthropic/claude-3.5-sonnet' },
  'claude-haiku': { provider: 'openrouter', model: 'anthropic/claude-3-haiku' },
  'gpt-4o': { provider: 'openai', model: 'gpt-4o' },
  'gpt-4o-mini': { provider: 'openai', model: 'gpt-4o-mini' },
};

export function loadAISettings(): AISettings {
  try {
    const stored = localStorage.getItem(AI_SETTINGS_KEY);
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return defaultSettings;
}

export function saveAISettings(settings: AISettings) {
  try {
    localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(settings));
  } catch { /* ignore */ }
}

export function loadChatHistory(): ChatMessage[] {
  try {
    const stored = localStorage.getItem(AI_HISTORY_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
}

export function saveChatHistory(messages: ChatMessage[]) {
  try {
    localStorage.setItem(AI_HISTORY_KEY, JSON.stringify(messages.slice(-50)));
  } catch { /* ignore */ }
}

export async function* streamAIResponse(
  messages: { role: string; content: string }[],
  settings: AISettings,
  scriptContext?: { name: string; code: string }
): AsyncGenerator<string, void, unknown> {
  if (!settings.apiKey) {
    throw new Error('API key not configured. Please set your API key in AI Settings.');
  }

  const resolvedModel = modelRegistry[settings.model] ?? {
    provider: settings.provider,
    model: settings.model,
  };

  const provider = resolvedModel.provider;
  const endpoint = provider === 'openrouter'
    ? 'https://openrouter.ai/api/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';

  const systemPrompt = `You are an expert Tampermonkey userscript developer assistant. You help users write, debug, and improve userscripts.

You have deep knowledge of:
- JavaScript and modern ES6+ syntax
- Tampermonkey API (GM_*, unsafeWindow, etc.)
- DOM manipulation and browser APIs
- Userscript best practices and security
- Common userscript patterns (ad blockers, UI enhancers, automation, etc.)

When analyzing code:
- Point out bugs, security issues, and inefficiencies
- Suggest improvements with specific code examples
- Explain what the code does in simple terms
- Provide complete, working solutions when asked

Current script context:
${scriptContext ? `Script name: ${scriptContext.name}\n\nCurrent code:\n\`\`\`javascript\n${scriptContext.code}\n\`\`\`` : 'No script currently open.'}

Respond concisely but thoroughly. Use markdown code blocks for code.`;

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content })),
  ];

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`,
      ...(provider === 'openrouter'
        ? {
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Tampermonkey AI Editor',
          }
        : {}),
    },
    body: JSON.stringify({
      model: resolvedModel.model,
      messages: apiMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (!trimmed.startsWith('data: ')) continue;

      try {
        const data = JSON.parse(trimmed.slice(6));
        const content = data.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch { /* ignore malformed JSON */ }
    }
  }
}
