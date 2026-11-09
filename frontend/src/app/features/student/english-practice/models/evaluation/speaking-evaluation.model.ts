export interface SpeakingEvaluationScores {
  topic_relevance: number;
  grammar: number;
  vocabulary: number;
  clarity: number;
}

export interface SpeakingEvaluation {
  scores: SpeakingEvaluationScores;
  overall_score: number;
  strengths: string[];
  improvements: string[];
  grammar_corrections: string[];
  suggestion: string;
}

export interface SpeakingEvaluationResponse {
  success: boolean;
  attempt_id: number;
  status: 'completed';
  evaluation: SpeakingEvaluation;
}