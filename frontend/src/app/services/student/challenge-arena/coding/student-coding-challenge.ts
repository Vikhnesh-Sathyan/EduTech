
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  attemptId: number;
  attemptNumber: number;
  evaluationStatus: string;
}

// ==========================================
// EVALUATION RESULT
// ==========================================

export interface CodingChallengeEvaluation {
  attemptId: number;
  score: number;
  passedTestCases: number;
  totalTestCases: number;
  resultStatus: string;
  feedback: string;
}

// ==========================================
// ATTEMPT HISTORY
// ==========================================

export interface StudentCodingChallengeAttempt {
  attempt_id: number;
  challenge_id: number;
  attempt_number: number;
  score: number | null;
  result_status: string;
  feedback: string | null;
  submitted_at: string;
  evaluated_at: string | null;
  challenge_title: string;
  difficulty: string;
  subject_name: string;
  challenge_type_name: string;
  challenge_type_key: string;
  created_by_name: string;
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
    submitted_content: {
      source_code: string;
    }
  ): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${challengeId}/submit`,
      { submitted_content }
    );
  }

  // EXECUTE SUBMITTED ATTEMPT

  executeAttempt(attemptId: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/attempts/${attemptId}/execute`,
      {}
    );
  }

  // GET ATTEMPT HISTORY

  getAttemptHistory(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/history`
    );
  }

  // GET INDIVIDUAL ATTEMPT RESULT

  getAttemptResult(attemptId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/attempts/${attemptId}`
    );
  }
}
