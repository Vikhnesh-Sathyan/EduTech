export type SpeakingAttemptStatus =
  | 'pending'
  | 'completed'
  | 'failed';

export interface SpeakingAttempt {
  id: number;
  topic_id: number | null;
  topic_title: string;
  status: SpeakingAttemptStatus;
}

export interface SpeakingAttemptHistory
  extends SpeakingAttempt {
  transcript: string | null;
  duration_seconds: number;
  word_count: number;
  speaking_speed: number;
  filler_count: number;
  repetition_count: number;
  pause_count: number;
  overall_score: number | null;
  evaluation_result: Record<string, unknown> | null;
  created_at: string;
}

export interface SpeakingHistoryResponse {
  success: boolean;
  attempts: SpeakingAttemptHistory[];
}