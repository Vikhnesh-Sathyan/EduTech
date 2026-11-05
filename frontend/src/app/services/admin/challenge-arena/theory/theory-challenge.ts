
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TheoryChallenge {
  id: number;
  subject_id: number;
  challenge_type_id: number;
  created_by: number;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'draft' | 'published' | 'archived';
  publish_at: string | null;
  created_at: string;
  subject_name: string;
  challenge_type_name: string;
  created_by_name: string;
}

export interface TheoryChallengeType {
  id: number;
  type_key: string;
  name: string;
  description: string | null;
  content_schema: any;
  status: 'active' | 'inactive';
}

interface TheoryChallengesResponse {
  success: boolean;
  count: number;
  challenges: TheoryChallenge[];
}

interface TheoryChallengeTypesResponse {
  success: boolean;
  challengeTypes: TheoryChallengeType[];
}

interface TheoryChallengeResponse {
  success: boolean;
  challenge: any;
}

interface ActionResponse {
  success: boolean;
  message: string;
  challengeId?: number;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TheoryChallengeService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5000/api/admin/theory-challenges';

  private typeApiUrl =
    'http://localhost:5000/api/admin/theory-challenge-types';


  // GET ALL THEORY CHALLENGES
  getTheoryChallenges(): Observable<TheoryChallengesResponse> {
    return this.http.get<TheoryChallengesResponse>(this.apiUrl);
  }


  // GET ACTIVE THEORY CHALLENGE TYPES
  getTheoryChallengeTypes(): Observable<TheoryChallengeTypesResponse> {
    return this.http.get<TheoryChallengeTypesResponse>(this.typeApiUrl);
  }


  // CREATE THEORY CHALLENGE
  createTheoryChallenge(data: any): Observable<ActionResponse> {
    return this.http.post<ActionResponse>(this.apiUrl, data);
  }


  // GET THEORY CHALLENGE DETAILS
  getTheoryChallengeById(
    challengeId: number
  ): Observable<TheoryChallengeResponse> {
    return this.http.get<TheoryChallengeResponse>(
      `${this.apiUrl}/${challengeId}`
    );
  }


  // UPDATE THEORY CHALLENGE
  updateTheoryChallenge(
    challengeId: number,
    data: any
  ): Observable<ActionResponse> {
    return this.http.put<ActionResponse>(
      `${this.apiUrl}/${challengeId}`,
      data
    );
  }


  // UPDATE CHALLENGE STATUS
  updateTheoryChallengeStatus(
    challengeId: number,
    status: 'draft' | 'published' | 'archived'
  ): Observable<ActionResponse> {
    return this.http.patch<ActionResponse>(
      `${this.apiUrl}/${challengeId}/status`,
      { status }
    );
  }

  // ==========================================
// DELETE THEORY CHALLENGE
// ==========================================

deleteTheoryChallenge(
  challengeId: number
): Observable<ActionResponse> {
  return this.http.delete<ActionResponse>(
    `${this.apiUrl}/${challengeId}`
  );
}

}
