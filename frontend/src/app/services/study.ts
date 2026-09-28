import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Study {

  private apiUrl = 'http://localhost:5000/api/study';

  constructor(private http: HttpClient) {}

  // Get subjects available for the logged-in student
  getSubjects() {
    return this.http.get(`${this.apiUrl}/subjects`);
  }

  // Get one subject by ID
getSubjectById(subjectId: string) {
  return this.http.get(
    `${this.apiUrl}/subjects/${subjectId}`
  );
}
}
