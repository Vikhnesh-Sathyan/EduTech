import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminDiagnostic {

  private apiUrl =
    'http://localhost:5000/api/admin/diagnostic-questions';

  constructor(private http: HttpClient) {}

  // Get all diagnostic questions
  getQuestions() {
    return this.http.get(this.apiUrl);
  }

  // Get active subjects
getSubjects() {
  return this.http.get(
    `${this.apiUrl}/subjects`
  );
}

// Get active topics for a subject
getTopics(subjectId: number) {
  return this.http.get(
    `${this.apiUrl}/subjects/${subjectId}/topics`
  );
}

}