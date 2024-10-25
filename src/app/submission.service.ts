// submission.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SubmissionService {
  private apiUrl = 'http://localhost:3000/submissions';

  constructor(private http: HttpClient) {}

  // Existing method: Get submissions
  getSubmissions(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Add this: Submit a new submission
  submitSubmission(submission: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, submission);
  }

  // Add this: Get student-specific submissions
  getStudentSubmissions(studentId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?studentId=${studentId}`);
  }

  // Corrected: Update submission status
  updateSubmissionStatus(submissionId: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${submissionId}`, { status });
  }
}
