// Handles student subject API communication

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StudentSubject {

  private apiUrl = 'http://localhost:5000/api/student/subjects';

  constructor(private http: HttpClient) {}

  // Get subjects available for the authenticated student
  getAvailableSubjects() {
    return this.http.get(`${this.apiUrl}/available`);
  }

  // Select a subject for the authenticated student
  selectSubject(subjectId: number) {
    return this.http.post(`${this.apiUrl}`, {
      subject_id: subjectId
    });
  }
}