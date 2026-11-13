
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StudentDailyQuiz {
  id: number;
  title: string;
  instructions: string;
  quiz_date: string;
  publish_time: string;
  expires_at: string;
  subject_id: number;
  subject_name: string;
  status: 'available' | 'completed';
  has_attempted: boolean;
  submitted_at: string | null;
}

export interface StudentDailyQuizDashboardResponse {
  success: boolean;
  message?: string;
  quiz: StudentDailyQuiz | null;
}

// ==========================================
// QUIZ WORKSPACE INTERFACES
// ==========================================

export interface QuizOption {
  option_id: number;
  option_text: string;
  option_order: number;
}

export interface QuizQuestion {
  question_id: number;
  question_text: string;
  question_order: number;
  options: QuizOption[];
}

export interface QuizWorkspace {
  id: number;
  title: string;
  instructions: string;
  subject_name: string;
  expires_at: string;
  questions: QuizQuestion[];
}

export interface QuizQuestionsResponse {
  success: boolean;
  quiz: QuizWorkspace;
}

// ==========================================
// QUIZ SUBMISSION INTERFACES
// ==========================================

export interface QuizAnswerSubmission {
  question_id: number;
  selected_option_id: number | null;
}

export interface QuizSubmissionResponse {
  success: boolean;
  message: string;
  result: {
    attempt_id: number;
    quiz_id: number;
    total_questions: number;
    correct_answers: number;
    wrong_answers: number;
    unanswered: number;
    score: number;
    submitted_at: string;
    answers: {
      question_id: number;
      question_text: string;
      selected_option_id: number | null;
      selected_answer: string | null;
      correct_option_id: number;
      correct_answer: string;
      is_correct: boolean;
      options: {
        id: number;
        option_text: string;
      }[];
    }[];
  };
}

export interface DailyQuizResultQuestion {
  question_id: number;
  question_text: string;
  question_order: number;

  selected_option_id: number | null;
  selected_answer: string | null;

  correct_option_id: number | null;
  correct_answer: string | null;

  is_correct: boolean;

  options: {
    id: number;
    option_text: string;
  }[];
}

export interface DailyQuizResult {
  attempt_id: number;
  quiz_id: number;

  quiz_title: string;
  quiz_date: string;

  subject_id: number;
  subject_name: string;

  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;

  score: number;
  submitted_at: string;

  questions: DailyQuizResultQuestion[];
}

export interface DailyQuizResultResponse {
  success: boolean;
  result: DailyQuizResult;
}

export interface DailyQuizHistoryItem {
  quiz_id: number;
  title: string;
  quiz_date: string;
  subject_id: number;
  subject_name: string;

  status: 'completed' | 'not_attempted';
  has_attempted: boolean;

  attempt_id: number | null;
  total_questions: number;

  correct_answers: number;
  wrong_answers: number;
  unanswered: number | null;

  score: number | null;
  submitted_at: string | null;

  can_view_result: boolean;
}

export interface DailyQuizHistoryResponse {
  success: boolean;
  total_quizzes: number;
  completed_quizzes: number;
  pending_quizzes: number;
  history: DailyQuizHistoryItem[];
}

// ==========================================
// DAILY QUIZ ACTIVITY INTERFACES
// ==========================================

export interface DailyQuizActivityStatistics {
  total_completed: number;
  current_streak: number;
  longest_streak: number;
  average_score: number;
  total_correct_answers: number;
}

export interface DailyQuizActivityItem {
  date: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  submitted_at: string;
}

export interface DailyQuizActivityResponse {
  success: boolean;
  statistics: DailyQuizActivityStatistics;
  activity: DailyQuizActivityItem[];
}

@Injectable({
  providedIn: 'root'
})
export class StudentDailyQuizService {

  private apiUrl = 'http://localhost:5000/api/student/daily-quiz';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<StudentDailyQuizDashboardResponse> {
    return this.http.get<StudentDailyQuizDashboardResponse>(
      `${this.apiUrl}/dashboard`
    );
  }

  // ==========================================
// GET QUIZ QUESTIONS
// ==========================================

getQuestions(quizId: number): Observable<QuizQuestionsResponse> {
  return this.http.get<QuizQuestionsResponse>(
    `${this.apiUrl}/${quizId}/questions`
  );
}

// ==========================================
// SUBMIT DAILY QUIZ
// ==========================================

submitQuiz(
  quizId: number,
  answers: QuizAnswerSubmission[]
): Observable<QuizSubmissionResponse> {

  return this.http.post<QuizSubmissionResponse>(
    `${this.apiUrl}/${quizId}/submit`,
    { answers }
  );
}

getQuizResult(quizId: number): Observable<DailyQuizResultResponse> {
  return this.http.get<DailyQuizResultResponse>(
    `${this.apiUrl}/${quizId}/result`
  );
}

getQuizHistory(): Observable<DailyQuizHistoryResponse> {
  return this.http.get<DailyQuizHistoryResponse>(
    `${this.apiUrl}/history`
  );
}

// ==========================================
// GET DAILY QUIZ ACTIVITY
// ==========================================

getQuizActivity(): Observable<DailyQuizActivityResponse> {
  return this.http.get<DailyQuizActivityResponse>(
    `${this.apiUrl}/activity`
  );
}

}
