
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentCareerInterviewExperiencesService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5000/api/student/career-hub';

  getFormData(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/interview-experiences/form-data`
    );
  }

  submitInterviewExperience(data: {
    company_id: number;
    job_role_id: number;
    country_id: number;
    experience_level: 'fresher' | 'experienced';
    questions_text: string;
  }): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/interview-experiences`,
      data
    );
  }

  getInterviewExperiences(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/interview-experiences`
    );
  }

}
