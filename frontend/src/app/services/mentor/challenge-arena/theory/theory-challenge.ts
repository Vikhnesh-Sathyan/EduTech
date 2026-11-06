
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Theory Challenge Type
export interface TheoryChallengeType {
  id: number;
  type_key: string;
  name: string;
  description: string | null;
  content_schema: any;
  status: 'active' | 'inactive';
}

// Theory Challenge
export interface TheoryChallenge {
  id: number;
  subject_id: number;
  challenge_type_id: number;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  instructions: string;
  status: 'draft' | 'published' | 'archived';
  subject_name?: string;
  challenge_type_name?: string;
  created_at?: string;
  publish_at?: string | null;
}

// Create Challenge Payload
export interface TheoryChallengePayload {
  subject_id: number;
  challenge_type_id: number;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  instructions: string;
  challenge_content: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class MentorTheoryChallengeService {

  private readonly apiUrl =
    'http://localhost:5000/api/mentor/theory-challenges';

  constructor(private readonly http: HttpClient) {}

  // Get available theory challenge types
  getTheoryChallengeTypes(): Observable<{
    types: TheoryChallengeType[];
  }> {
    return this.http.get<{
      types: TheoryChallengeType[];
    }>(`${this.apiUrl}/types`);
  }

  // Get mentor's theory challenges
  getMyTheoryChallenges(): Observable<{
    challenges: TheoryChallenge[];
  }> {
    return this.http.get<{
      challenges: TheoryChallenge[];
    }>(this.apiUrl);
  }

  // Get individual challenge
  getTheoryChallengeById(challengeId: number): Observable<{
    challenge: any;
  }> {
    return this.http.get<{
      challenge: any;
    }>(`${this.apiUrl}/${challengeId}`);
  }

  // Create challenge
  createTheoryChallenge(
    payload: TheoryChallengePayload
  ): Observable<{
    message: string;
    challengeId?: number;
  }> {
    return this.http.post<{
      message: string;
      challengeId?: number;
    }>(this.apiUrl, payload);
  }

  // Update challenge
  updateTheoryChallenge(
    challengeId: number,
    payload: TheoryChallengePayload
  ): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/${challengeId}`,
      payload
    );
  }

  // Update challenge status
  updateTheoryChallengeStatus(
    challengeId: number,
    status: 'draft' | 'published' | 'archived'
  ): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.apiUrl}/${challengeId}/status`,
      { status }
    );
  }

  // Get academic groups and subjects
  getChallengeAcademics() {
    return this.http.get<{
      success: boolean;
      academics: any[];
    }>('http://localhost:5000/api/mentor/challenge-academics');
  }

  // Delete theory challenge
  deleteTheoryChallenge(challengeId: number) {
    return this.http.delete<{
      success: boolean;
      message: string;
    }>(`${this.apiUrl}/${challengeId}`);
  }

}
