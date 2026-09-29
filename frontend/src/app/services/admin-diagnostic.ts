import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminDiagnostic {

  private apiUrl =
    'http://localhost:5000/api/admin/diagnostic-questions';

  constructor(
    private http: HttpClient
  ) {}

  getQuestions() {
    return this.http.get(this.apiUrl);
  }

  getSubjects() {
    return this.http.get(
      `${this.apiUrl}/subjects`
    );
  }

  getTopics(subjectId: number) {
    return this.http.get(
      `${this.apiUrl}/subjects/${subjectId}/topics`
    );
  }

  createQuestion(data: any) {
    return this.http.post(
      this.apiUrl,
      data
    );
  }
}