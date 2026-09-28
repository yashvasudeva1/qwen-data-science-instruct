export type VegapunkModel = 'vegapunk-3.7-datascience';

export interface ModelInfo {
  id: VegapunkModel;
  name: string;
  badge?: string;
  description: string;
  bestFor: string;
  contextWindow: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  textContent?: string;
}

export interface Artifact {
  id: string;
  title: string;
  type: 'code' | 'html' | 'markdown' | 'svg' | 'react';
  language?: string;
  content: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  thinking?: string;
  thinkingDuration?: number;
  attachments?: Attachment[];
  artifacts?: Artifact[];
  modelUsed?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  model: VegapunkModel;
  isStarred?: boolean;
  projectId?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  customInstructions: string;
  filesCount: number;
  color: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  plan: 'free' | 'pro' | 'team';
  usagePercentage: number;
}
