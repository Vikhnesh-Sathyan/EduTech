import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JobService {
  private apiUrl = 'http://localhost:3000/api/jobs'; // Replace with your API URL

  constructor(private http: HttpClient) {}

  // Fetch jobs
  getJobs(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Add a job
  addJob(job: any): Observable<any> {
    return this.http.post(this.apiUrl, job);
  }

  // Delete a job
  deleteJob(jobId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${jobId}`);
  }
  applyForJob(payload: { jobId: number; studentId: number }): Observable<any> {
    const applyUrl = `${this.apiUrl}/apply`;
    return this.http.post(applyUrl, payload);
  }
}
