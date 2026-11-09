import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  SpeakingTopicResponse
} from '../../models/topics/speaking-topic.model';

@Injectable({
  providedIn: 'root'
})
export class SpeakingTopicsService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:5000/api/english-practice/topics';

  // GENERATE A RANDOM SPEAKING TOPIC
  generateTopic(
    category?: string,
    difficulty?: string
  ): Observable<SpeakingTopicResponse> {

    return this.http.post<SpeakingTopicResponse>(
      `${this.apiUrl}/random`,
      {
        category: category || null,
        difficulty: difficulty || null
      }
    );
  }

}