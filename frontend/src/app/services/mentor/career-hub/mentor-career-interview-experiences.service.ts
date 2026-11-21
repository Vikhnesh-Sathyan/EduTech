
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InterviewCompany {
  id: number;
  company_name: string;
}

export interface InterviewRole {
  id: number;
  role_name: string;
}

export interface InterviewCountry {
  id: number;
  country_name: string;
  country_code: string;
}

export interface InterviewFormData {
  companies: InterviewCompany[];
  roles: InterviewRole[];
  countries: InterviewCountry[];
}

export interface InterviewExperience {
  id: number;
  company_id: number;
  company_name: string;
  job_role_id: number;
  role_name: string;
  country_id: number;
  country_name: string;
  experience_level: 'fresher' | 'experienced';
  questions_text: string;
  created_by: number;
  contributor_name: string;
  status: 'published' | 'archived';
  created_at: string;
}

export interface SubmitInterviewExperience {
  company_id: number;
  job_role_id: number;
  country_id: number;
  experience_level: 'fresher' | 'experienced';
  questions_text: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class MentorCareerInterviewExperiencesService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5000/api/mentor/career-hub';

  // GET FORM DATA
  getFormData(): Observable<ApiResponse<InterviewFormData>> {
    return this.http.get<ApiResponse<InterviewFormData>>(
      `${this.apiUrl}/interview-experiences/form-data`
    );
  }

  // GET INTERVIEW EXPERIENCES
  getInterviewExperiences(): Observable<ApiResponse<InterviewExperience[]>> {
    return this.http.get<ApiResponse<InterviewExperience[]>>(
      `${this.apiUrl}/interview-experiences`
    );
  }

  // SUBMIT INTERVIEW EXPERIENCE
  submitInterviewExperience(
    data: SubmitInterviewExperience
  ): Observable<ApiResponse<{ experience_id: number; status: string }>> {
    return this.http.post<ApiResponse<{ experience_id: number; status: string }>>(
      `${this.apiUrl}/interview-experiences`,
      data
    );
  }
}
