export type SpeakingTopicDifficulty =
  | 'easy'
  | 'medium'
  | 'hard';

export interface SpeakingTopic {
  id: number;
  subject_id: number | null;
  title: string;
  prompt: string;
  category: string;
  difficulty: SpeakingTopicDifficulty;
}

export interface SpeakingTopicResponse {
  success: boolean;
  topic: SpeakingTopic;
}