
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  CreateDebateRequest,
  CreateDebateResponse,
  DebateArgumentRequest,
  DebateArgumentResponse,
  DebateHistoryResponse,
  DebateSessionResponse,
  DebateEvaluationRequest,
  DebateEvaluationResponse
} from '../../models/debate/debate.model';

@Injectable({
  providedIn: 'root'
})
export class DebateService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5000/api/english-practice/debate';

  private evaluationUrl =
    'http://localhost:5000/api/english-practice/debate-evaluation';


  // Create a new debate session
  createSession(
    data: CreateDebateRequest
  ): Observable<CreateDebateResponse> {

    return this.http.post<CreateDebateResponse>(
      `${this.apiUrl}/sessions`,
      data
    );
  }


  // Send a student argument and receive the AI response
  sendArgument(
    data: DebateArgumentRequest
  ): Observable<DebateArgumentResponse> {

    return this.http.post<DebateArgumentResponse>(
      `${this.apiUrl}/respond`,
      data
    );
  }


  // Load the student's debate history
  getHistory(): Observable<DebateHistoryResponse> {

    return this.http.get<DebateHistoryResponse>(
      `${this.apiUrl}/history`
    );
  }


  // Load one debate session with its arguments
  getSessionDetails(
    sessionId: number
  ): Observable<DebateSessionResponse> {

    return this.http.get<DebateSessionResponse>(
      `${this.apiUrl}/sessions/${sessionId}`
    );
  }


  // Abandon an active debate
  abandonSession(
    sessionId: number
  ): Observable<{ success: boolean; message: string }> {

    return this.http.patch<{ success: boolean; message: string }>(
      `${this.apiUrl}/sessions/${sessionId}/abandon`,
      {}
    );
  }


  // Evaluate a completed debate
  evaluateSession(
    data: DebateEvaluationRequest
  ): Observable<DebateEvaluationResponse> {

    return this.http.post<DebateEvaluationResponse>(
      `${this.evaluationUrl}/evaluate`,
      data
    );
  }

}
