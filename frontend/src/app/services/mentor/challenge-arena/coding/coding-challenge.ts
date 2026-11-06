import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Coding Challenge Type
export interface CodingChallengeType {
  id: number;
  type_key: string;
  name: string;
  description: string | null;
  content_schema: any;
  status: 'active' | 'inactive';
}

// Coding Challenge
export interface CodingChallenge {
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
export interface CodingChallengePayload {
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
export class MentorCodingChallengeService {

  private readonly apiUrl =
    'http://localhost:5000/api/mentor/coding-challenges';

  constructor(private readonly http: HttpClient) {}

  // Get available challenge types
  getCodingChallengeTypes(): Observable<{
    types: CodingChallengeType[];
  }> {
    return this.http.get<{
      types: CodingChallengeType[];
    }>(`${this.apiUrl}/types`);
  }

  // Get mentor's coding challenges
  getMyCodingChallenges(): Observable<{
    challenges: CodingChallenge[];
  }> {
    return this.http.get<{
      challenges: CodingChallenge[];
    }>(this.apiUrl);
  }

  // Get individual challenge
  getCodingChallengeById(challengeId: number): Observable<{
    challenge: any;
  }> {
    return this.http.get<{
      challenge: any;
    }>(`${this.apiUrl}/${challengeId}`);
  }

  // Create challenge
  createCodingChallenge(
    payload: CodingChallengePayload
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
  updateCodingChallenge(
    challengeId: number,
    payload: CodingChallengePayload
  ): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/${challengeId}`,
      payload
    );
  }

  // Update challenge status
  updateCodingChallengeStatus(
    challengeId: number,
    status: 'draft' | 'published' | 'archived'
  ): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.apiUrl}/${challengeId}/status`,
      { status }
    );
  }

  // Get academic groups and subjects available to this mentor
getChallengeAcademics() {
  return this.http.get<{
    success: boolean;
    academics: any[];
  }>('http://localhost:5000/api/mentor/challenge-academics');
}

// Delete coding challenge
deleteCodingChallenge(challengeId: number) {
  return this.http.delete<{ success: boolean; message: string }>(
    `${this.apiUrl}/${challengeId}`
  );
}

}