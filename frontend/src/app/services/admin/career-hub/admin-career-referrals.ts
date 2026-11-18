
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CareerReferral {
  id: number;
  company_id: number;
  company_name: string;
  job_role_id: number;
  role_name: string;
  country_id: number;
  country_name: string;
  job_link: string;
  referral_instructions: string;
  created_by: number;
  status: string;
  created_at: string;
  contributor_name: string;
  contributor_role: string;
}

interface ReferralResponse {
  success: boolean;
  message?: string;
  referrals?: CareerReferral[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminCareerReferrals {

  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:5000/api/admin/career-hub/referrals';

  getReferrals(): Observable<ReferralResponse> {
    return this.http.get<ReferralResponse>(this.apiUrl);
  }

  archiveReferral(id: number): Observable<ReferralResponse> {
    return this.http.patch<ReferralResponse>(
      `${this.apiUrl}/${id}/archive`,
      {}
    );
  }
}
