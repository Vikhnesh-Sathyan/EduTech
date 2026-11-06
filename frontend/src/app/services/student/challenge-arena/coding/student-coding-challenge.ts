
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ==========================================
// REVIEW STATUS
// ==========================================

export type CodingChallengeReviewStatus =
  | 'pending'
  | 'correct'
  | 'incorrect';

// ==========================================
// CHALLENGE
// ==========================================

export interface StudentCodingChallenge {
  id: number;
  title: string;
  difficulty: string;
  instructions: string;
  subject_name: string;
  challenge_type_name: string;
  challenge_type_key: string;
  created_by_name?: string;
}

// ==========================================
// CHALLENGE DETAILS
// ==========================================

export interface StudentCodingChallengeDetails
  extends StudentCodingChallenge {
  challenge_content: {
    code_snippet?: string;
    bug_description?: string;
    expected_behavior?: string;
    database_schema?: string;
    problem_description?: string;
  };
}

// ==========================================
// SUBMISSION
// ==========================================

export interface CodingChallengeSubmission {
  success: boolean;
  message: string;
  attemptId: number;
  attemptNumber: number;
  reviewStatus: CodingChallengeReviewStatus;
}

// ==========================================
// ATTEMPT HISTORY
// ==========================================

export interface StudentCodingChallengeAttempt {
  attempt_id: number;
  challenge_id: number;
  attempt_number: number;
  review_status: CodingChallengeReviewStatus;
  feedback: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  challenge_title: string;
  difficulty: string;
  subject_name: string;
  challenge_type_name: string;
  challenge_type_key: string;
  created_by_name: string;
}

// ==========================================
// INDIVIDUAL ATTEMPT RESULT
// ==========================================

export interface StudentCodingChallengeAttemptResult
  extends StudentCodingChallengeAttempt {
  student_id: number;
  submitted_content: Record<string, unknown>;
  reviewMessage: string;
}

// ==========================================
// STUDENT CODING CHALLENGE SERVICE
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class StudentCodingChallengeService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5000/api/student/coding-challenges';

  // GET ALL CHALLENGES

  getChallenges(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // GET CHALLENGE DETAILS

  getChallengeById(challengeId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/${challengeId}`
    );
  }

  // SUBMIT CHALLENGE

  submitChallenge(
    challengeId: number,
    submitted_content: Record<string, unknown>
  ): Observable<CodingChallengeSubmission> {
    return this.http.post<CodingChallengeSubmission>(
      `${this.apiUrl}/${challengeId}/submit`,
      { submitted_content }
    );
  }

  // GET ATTEMPT HISTORY

  getAttemptHistory(): Observable<{
    success: boolean;
    count: number;
    attempts: StudentCodingChallengeAttempt[];
  }> {
    return this.http.get<{
      success: boolean;
      count: number;
      attempts: StudentCodingChallengeAttempt[];
    }>(`${this.apiUrl}/history`);
  }

  // GET INDIVIDUAL ATTEMPT RESULT

  getAttemptResult(attemptId: number): Observable<{
    success: boolean;
    message: string;
    reviewMessage: string;
    attempt: StudentCodingChallengeAttemptResult;
  }> {
    return this.http.get<{
      success: boolean;
      message: string;
      reviewMessage: string;
      attempt: StudentCodingChallengeAttemptResult;
    }>(`${this.apiUrl}/attempts/${attemptId}`);
  }
}
