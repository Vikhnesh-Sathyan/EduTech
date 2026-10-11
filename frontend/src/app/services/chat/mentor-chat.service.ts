//student's conversation, history and read API.

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MentorChatService {

  private readonly apiUrl = 'http://localhost:5000/api/chat';

  constructor(private http: HttpClient) {}

  // Load the logged-in mentor's student conversations.
  getInbox(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/mentor-inbox`
    );
  }

  // Load the message history for a selected student.
  getMessages(conversationId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${conversationId}/messages`
    );
  }

  // Mark messages received from the student as read.
  markMessagesAsRead(
    conversationId: number
  ): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${conversationId}/read`,
      {}
    );
  }
}
