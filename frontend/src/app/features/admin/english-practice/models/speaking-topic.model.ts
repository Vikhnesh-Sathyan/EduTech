export type SpeakingTopicDifficulty =
  | 'easy'
  | 'medium'
  | 'hard';

export type SpeakingTopicStatus =
  | 'active'
  | 'inactive';

export interface AdminSpeakingTopic {
  id: number;
  subject_id: number | null;
  title: string;
  prompt: string;
  category: string | null;
  difficulty: SpeakingTopicDifficulty;
  status: SpeakingTopicStatus;
  created_at?: string;
  updated_at?: string;
}

export interface AdminSpeakingTopicsResponse {
  success: boolean;
  topics: AdminSpeakingTopic[];
}

export interface AdminSpeakingTopicResponse {
  success: boolean;
  topic: AdminSpeakingTopic;
}

export interface SpeakingTopicSubject {
  id: number;
  name: string;
  status: 'active' | 'inactive';
  year_name: string;
  department_name: string;
  program_name: string;
}

export interface SpeakingTopicSubjectsResponse {
  subjects: SpeakingTopicSubject[];
}