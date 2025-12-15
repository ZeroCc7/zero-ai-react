
export interface User {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
}

export interface Conversation {
  id: number;
  title: string;
  user_id: number;
  created_at: string;
  updated_at?: string;
}

export interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  conversation_id: number;
  created_at: string;
  prompt_tokens?: number;
  completion_tokens?: number;
}

export interface LLMKey {
  id: number;
  model_name: string;
  base_url?: string;
  is_active: boolean;
  is_valid?: boolean;
  last_validated_at?: string;
  created_at: string;
}

export interface UserApiToken {
  id: number;
  name: string;
  user_id: number;
  token_prefix: string;
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
  token?: string; // Only present upon creation
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface ApiError {
  detail: string | { loc: string[]; msg: string; type: string }[];
}
