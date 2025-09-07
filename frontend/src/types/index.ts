export interface User {
  id: number;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
  token: string;
}

export interface EmailLog {
  id: number;
  user_id: number;
  email_to: string;
  template_id: number;
  status: 'pending' | 'sent' | 'failed';
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface BulkEmailRequest {
  emails: string[];
  templateId: number;
  subject: string;
  body: string;
}

export interface BulkEmailResponse {
  total: number;
  valid: number;
  invalid: string[];
  successful: number;
  failed: number;
}

export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  created_at: string;
}