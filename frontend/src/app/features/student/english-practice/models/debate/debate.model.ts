export type StudentPosition = 'for' | 'against';

export type DebateStatus = 'active' | 'completed' | 'abandoned';

export interface CreateDebateRequest {
  topic: string;
  studentPosition: StudentPosition;
}

export interface CreateDebateResponse {
  success: boolean;
  sessionId: number;
}

export interface DebateArgumentRequest {
  sessionId: number;
  studentArgument: string;
}

export interface DebateArgumentResponse {
  success: boolean;
  ai_position: StudentPosition;
  response: string;
}

export interface DebateArgument {
  id: number;
  session_id: number;
  sequence_number: number;
  student_argument: string;
  ai_response: string | null;
  created_at: string;
}

export interface DebateSession {
  id: number;
  student_id: number;
  topic: string;
  student_position: StudentPosition;
  status: DebateStatus;
  created_at: string;
  updated_at: string;
  overall_score: number | null;
  evaluation_result: DebateEvaluation | null;
  evaluated_at: string | null;
  arguments?: DebateArgument[];
}


export interface DebateEvaluation {
  scores: {
    argument_quality: number;
    topic_relevance: number;
    grammar: number;
    vocabulary: number;
    critical_thinking: number;
  };
  overall_score: number;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  summary: string;
}


export interface DebateHistoryResponse {
  success: boolean;
  sessions: DebateSession[];
}

export interface DebateSessionResponse {
  success: boolean;
  session: DebateSession;
}

export interface DebateEvaluationRequest {
  sessionId: number;
}

export interface DebateEvaluationResponse {
  success: boolean;
  evaluation: DebateEvaluation;
}