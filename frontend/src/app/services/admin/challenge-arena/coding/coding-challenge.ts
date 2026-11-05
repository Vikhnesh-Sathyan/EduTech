import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CodingChallengeService {

  private apiUrl = 'http://localhost:5000/api/admin/coding-challenges';

  private typeApiUrl = 'http://localhost:5000/api/admin/coding-challenge-types';

  constructor(private http: HttpClient) {}

  // Get all coding challenges
  getCodingChallenges(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Get coding challenge by ID
  getCodingChallengeById(challengeId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${challengeId}`);
  }

  // Get coding challenge types
  getCodingChallengeTypes(): Observable<any> {
    return this.http.get(this.typeApiUrl);
  }

  // Create coding challenge
  createCodingChallenge(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // Update coding challenge
  updateCodingChallenge(challengeId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${challengeId}`, data);
  }

  // Update challenge status
  updateCodingChallengeStatus(
    challengeId: number,
    status: 'draft' | 'published' | 'archived'
  ): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${challengeId}/status`,
      { status }
    );
  }

  // DELETE CODING CHALLENGE
deleteCodingChallenge(challengeId: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${challengeId}`);
}
}
