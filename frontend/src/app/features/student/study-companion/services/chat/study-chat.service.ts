
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  StudyChatHistoryResponse,
  StudyChatQuestionRequest,
  StudyChatQuestionResponse
} from '../../models/chat/study-chat.model';

@Injectable({
  providedIn: 'root'
})
export class StudyChatService {

  private apiUrl =
    'http://localhost:5000/api/student/study-companion';

  constructor(private http: HttpClient) {}

  // GET SAVED CHAT HISTORY
  getChatHistory(
    sessionUuid: string
  ): Observable<StudyChatHistoryResponse> {

    return this.http.get<StudyChatHistoryResponse>(
      `${this.apiUrl}/${sessionUuid}/messages`
    );
  }

  // ASK QUESTION
  askQuestion(
    sessionUuid: string,
    question: string
  ): Observable<StudyChatQuestionResponse> {

    const request: StudyChatQuestionRequest = {
      question
    };

    return this.http.post<StudyChatQuestionResponse>(
      `${this.apiUrl}/${sessionUuid}/ask`,
      request
    );
  }
}
