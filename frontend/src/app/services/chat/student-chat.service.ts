//mentor inbox, history and read API.

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentChatService {

  private readonly apiUrl = 'http://localhost:5000/api/chat';

  constructor(private http: HttpClient) {}

  // Get the logged-in student's active mentor conversation.
  getMyConversation(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/my-conversation`
    );
  }

  // Load the message history for a conversation.
  getMessages(conversationId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${conversationId}/messages`
    );
  }

  // Mark messages received from the mentor as read.
  markMessagesAsRead(
    conversationId: number
  ): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${conversationId}/read`,
      {}
    );
  }
}
