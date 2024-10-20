// messages.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private apiUrl = 'http://localhost:3000/api/messages';  // Update if necessary

  constructor(private http: HttpClient) {}

  // Send a message
  sendMessage(sender: string, recipient: string, content: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { sender, recipient, content });
  }

  // Fetch messages for a specific student by their ID (recipient)
  getMessagesForStudent(recipient: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${recipient}`);
  }
}
