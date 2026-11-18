
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ==========================================
// INTERFACES
// ==========================================

export interface JobCompany {
  id: number;
  company_name: string;
}

export interface JobRole {
  id: number;
  role_name: string;
}

export interface JobCountry {
  id: number;
  country_name: string;
  country_code: string;
}

export interface JobFormData {
  companies: JobCompany[];
  roles: JobRole[];
  countries: JobCountry[];
}

export interface CareerJob {
  id: number;
  company_id: number;
  company_name: string;
  job_role_id: number;
  role_name: string;
  country_id: number;
  country_name: string;
  state: string | null;
  city: string | null;
  experience_level: 'fresher' | 'experienced';
  employment_type: string;
  job_link: string;
  created_by: number;
  created_by_name: string;
  status: 'pending' | 'published' | 'rejected' | 'archived';
  created_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface SubmitCareerJob {
  company_id: number | null;
  company_name: string | null;
  job_role_id: number;
  country_id: number;
  state?: string;
  city?: string;
  experience_level: 'fresher' | 'experienced';
  job_link: string;
}

// ==========================================
// STUDENT CAREER JOBS SERVICE
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class StudentCareerJobsService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5000/api/student/career-hub';

  // GET JOB FORM DATA
  getJobFormData(): Observable<ApiResponse<JobFormData>> {
    return this.http.get<ApiResponse<JobFormData>>(
      `${this.apiUrl}/jobs/form-data`
    );
  }

  // GET AVAILABLE JOBS AND OWN SUBMISSIONS
  getJobs(): Observable<ApiResponse<CareerJob[]>> {
    return this.http.get<ApiResponse<CareerJob[]>>(
      `${this.apiUrl}/jobs`
    );
  }

  // SUBMIT A NEW JOB
  submitJob(data: SubmitCareerJob): Observable<ApiResponse<{
    job_id: number;
    status: string;
  }>> {
    return this.http.post<ApiResponse<{
      job_id: number;
      status: string;
    }>>(
      `${this.apiUrl}/jobs`,
      data
    );
  }

}
