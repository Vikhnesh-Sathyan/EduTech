import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MockInterviewService {
  private apiUrl = 'http://localhost:3000/api/mock-interview/questions';

  constructor(private http: HttpClient) {}

  // Get questions for a specific interview type
  getMockInterviewQuestions(interviewType: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${interviewType}`); // Updated to use path parameter
  }

  // Add a new question
  addQuestion(interviewType: string, question: string): Observable<any> {
    return this.http.post(this.apiUrl, { interviewType, question });
  }
}
