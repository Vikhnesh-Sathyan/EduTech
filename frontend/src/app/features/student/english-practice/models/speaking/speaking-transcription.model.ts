import { SpeakingAttempt } from './speaking-attempt.model';

export interface SpeechSegment {
  start: number;
  end: number;
  text: string;
}

export interface SpeakingTranscription {
  success: boolean;
  language: string;
  transcript: string;
  duration_seconds: number;
  segments: SpeechSegment[];
}

export interface SpeakingTranscriptionResponse
  extends SpeakingTranscription {
  attempt: SpeakingAttempt;
}