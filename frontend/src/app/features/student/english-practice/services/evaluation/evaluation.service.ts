
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  SpeakingEvaluationResponse
} from '../../models/evaluation/speaking-evaluation.model';

import {
  SpeakingAttemptDetailsResponse
} from '../../models/speaking/speaking-attempt.model';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:5000/api/english-practice/topic-evaluation';

  // EVALUATE A SPEAKING ATTEMPT
  evaluateAttempt(
    attemptId: number
  ): Observable<SpeakingEvaluationResponse> {

    return this.http.post<SpeakingEvaluationResponse>(
      `${this.apiUrl}/evaluate`,
      {
        attempt_id: attemptId
      }
    );
  }

  // GET COMPLETE EVALUATION DETAILS
  getAttemptDetails(
    attemptId: number
  ): Observable<SpeakingAttemptDetailsResponse> {

    return this.http.get<SpeakingAttemptDetailsResponse>(
      `${this.apiUrl}/attempts/${attemptId}`
    );
  }

}
