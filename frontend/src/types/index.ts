export type MascotState = 'idle' | 'listening' | 'thinking' | 'responding' | 'success' | 'error';

export type AppTheme = 'midnight' | 'electric_yellow' | 'pure_dark' | 'cyber_glass';

export interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  timestamp: string;
  html: string;
  status: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profile_image?: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments_meta?: string;
  token_usage?: number;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  message_count?: number;
  last_message?: string;
}

export interface UploadedFileItem {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  extracted_text_preview?: string;
  created_at: string;
}

export interface UserPreferences {
  theme: AppTheme;
  selected_model: string;
  voice_enabled: boolean;
  memory_enabled: boolean;
  system_prompt?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  description: string;
  context_window: string;
  capabilities: string[];
  is_available: boolean;
}

export interface ResearchSource {
  title: string;
  url: string;
  snippet: string;
  domain: string;
}

export interface ResearchResponse {
  query: string;
  summary: string;
  sources: ResearchSource[];
  key_takeaways: string[];
}
