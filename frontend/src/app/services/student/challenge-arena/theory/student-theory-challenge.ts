
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ==========================================
// THEORY CHALLENGE
// ==========================================

export interface StudentTheoryChallenge {
  id: number;
  subject_id: number;
  challenge_type_id: number;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  instructions: string;
  subject_name: string;
  challenge_type_name: string;
  challenge_type_key: string;
  content_schema: any;
  created_by_name: string;
  creator_role: 'admin' | 'mentor';
  challenge_source: 'admin' | 'mentor';
  created_at: string;
}

// ==========================================
// THEORY CHALLENGE SERVICE
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class StudentTheoryChallengeService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:5000/api/student/theory-challenges';

  // ==========================================
  // GET AVAILABLE THEORY CHALLENGES
  // ==========================================

  getTheoryChallenges(): Observable<{
    success: boolean;
    count: number;
    challenges: StudentTheoryChallenge[];
  }> {
    return this.http.get<{
      success: boolean;
      count: number;
      challenges: StudentTheoryChallenge[];
    }>(this.apiUrl);
  }

  // ==========================================
  // GET INDIVIDUAL THEORY CHALLENGE
  // ==========================================

  getTheoryChallengeById(challengeId: number): Observable<{
    success: boolean;
    challenge: any;
  }> {
    return this.http.get<{
      success: boolean;
      challenge: any;
    }>(`${this.apiUrl}/${challengeId}`);
  }

  // ==========================================
  // SUBMIT THEORY CHALLENGE
  // ==========================================

  submitTheoryChallenge(
    challengeId: number,
    payload: Record<string, any>
  ): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${challengeId}/submit`,
      payload
    );
  }

  // ==========================================
  // GET STUDENT THEORY HISTORY
  // ==========================================

  getTheoryChallengeHistory(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/history`);
  }

  // ==========================================
  // GET THEORY ATTEMPT RESULT
  // ==========================================

  getTheoryChallengeAttemptResult(
    attemptId: number
  ): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/attempts/${attemptId}`
    );
  }

}
