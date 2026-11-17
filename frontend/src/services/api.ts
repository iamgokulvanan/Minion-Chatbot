import {
  User,
  Conversation,
  Message,
  UploadedFileItem,
  UserPreferences,
  ModelInfo,
  ResearchResponse
} from '../types';

const API_BASE = '/api';

function getHeaders(customHeaders: Record<string, string> = {}): HeadersInit {
  const token = localStorage.getItem('minion_token');
  const headers: Record<string, string> = {
    ...customHeaders,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async loginDemo(): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/demo`);
    if (!res.ok) throw new Error('Demo login failed');
    return res.json();
  },

  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  },

  async register(name: string, email: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  // Conversations
  async getConversations(search?: string): Promise<Conversation[]> {
    const url = search ? `${API_BASE}/conversations?search=${encodeURIComponent(search)}` : `${API_BASE}/conversations`;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch conversations');
    return res.json();
  },

  async getConversation(id: string): Promise<Conversation & { messages: Message[] }> {
    const res = await fetch(`${API_BASE}/conversations/${id}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load conversation');
    return res.json();
  },

  async createConversation(title?: string): Promise<Conversation> {
    const res = await fetch(`${API_BASE}/conversations`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error('Failed to create conversation');
    return res.json();
  },

  async updateConversation(id: string, updates: { title?: string; is_pinned?: boolean }): Promise<Conversation> {
    const res = await fetch(`${API_BASE}/conversations/${id}`, {
      method: 'PATCH',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update conversation');
    return res.json();
  },

  async deleteConversation(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/conversations/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete conversation');
  },

  // File Upload
  async uploadFile(file: File, conversation_id?: string): Promise<UploadedFileItem> {
    const formData = new FormData();
    formData.append('file', file);
    if (conversation_id) {
      formData.append('conversation_id', conversation_id);
    }

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: getHeaders(),
      body: formData,
    });
    if (!res.ok) throw new Error('File upload failed');
    return res.json();
  },

  async analyzeDocument(file_id: string, query?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/upload/analyze`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ file_id, query }),
    });
    if (!res.ok) throw new Error('Document analysis failed');
    return res.json();
  },

  // Research
  async performResearch(query: string): Promise<ResearchResponse> {
    const res = await fetch(`${API_BASE}/research`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error('Web research failed');
    return res.json();
  },

  // Settings
  async getSettings(): Promise<UserPreferences> {
    const res = await fetch(`${API_BASE}/settings`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(prefs: Partial<UserPreferences>): Promise<UserPreferences> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(prefs),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  // Models
  async getModels(): Promise<ModelInfo[]> {
    const res = await fetch(`${API_BASE}/models`);
    if (!res.ok) throw new Error('Failed to fetch models');
    return res.json();
  },

  // Streaming Chat Completion
  streamChatMessage(
    payload: {
      content: string;
      conversation_id?: string;
      model?: string;
      file_ids?: string[];
      mode?: string;
    },
    callbacks: {
      onInit?: (data: { conversation_id: string; title: string }) => void;
      onChunk: (chunk: string) => void;
      onDone?: (data: { message_id: string; conversation_id: string }) => void;
      onError?: (err: Error) => void;
    },
    signal?: AbortSignal
  ) {
    const headers = getHeaders({ 'Content-Type': 'application/json' });

    fetch(`${API_BASE}/chat/send`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Chat error (${response.status})`);
        }
        if (!response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(trimmed.slice(6));
                if (parsed.type === 'init' && callbacks.onInit) {
                  callbacks.onInit(parsed);
                } else if (parsed.type === 'delta') {
                  callbacks.onChunk(parsed.chunk);
                } else if (parsed.type === 'done' && callbacks.onDone) {
                  callbacks.onDone(parsed);
                } else if (parsed.type === 'error' && callbacks.onError) {
                  callbacks.onError(new Error(parsed.message));
                }
              } catch (e) {
                // Ignore parse errors on keep-alives
              }
            }
          }
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        if (callbacks.onError) callbacks.onError(err);
      });
  },
};
