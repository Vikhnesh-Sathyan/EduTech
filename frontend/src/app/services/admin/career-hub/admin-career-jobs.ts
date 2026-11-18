
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminCareerJobs {

  private apiUrl = 'http://localhost:5000/api/admin/career-hub';

  constructor(private http: HttpClient) {}

  // GET ALL CAREER JOBS
  getCareerJobs(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/jobs`
    );
  }

  // APPROVE JOB
  approveCareerJob(jobId: number): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/jobs/${jobId}/approve`,
      {}
    );
  }

  // REJECT JOB
  rejectCareerJob(jobId: number): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/jobs/${jobId}/reject`,
      {}
    );
  }

  // ARCHIVE JOB
  archiveCareerJob(jobId: number): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/jobs/${jobId}/archive`,
      {}
    );
  }

  // ==========================================
// GET JOB FORM DROPDOWN DATA
// ==========================================

getJobFormData(): Observable<any> {
  return this.http.get(`${this.apiUrl}/jobs/form-data`);
}


// ==========================================
// CREATE AND PUBLISH JOB
// ==========================================

createCareerJob(jobData: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/jobs`, jobData);
}

}
