export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tokens_in?: number;
  tokens_out?: number;
}

export interface Case {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface CaseDetails {
  id: string;
  title: string;
  language: string;
  patient_name: string;
  patient_age: number;
  patient_occupation: string;
}

export interface SessionCreateResponse {
  session_id: string;
}

export interface ChatResponse {
  reply: string;
  tokens_in?: number;
  tokens_out?: number;
}

