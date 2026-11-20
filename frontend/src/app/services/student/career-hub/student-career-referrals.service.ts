
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentCareerReferralsService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5000/api/student/career-hub';

  getReferralFormData(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/referrals/form-data`
    );
  }

  submitCareerReferral(data: {
    company_id: number;
    job_role_id: number;
    country_id: number;
    job_link: string;
    referral_instructions: string;
  }): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/referrals`,
      data
    );
  }

  getCareerReferrals(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/referrals`
    );
  }

}
