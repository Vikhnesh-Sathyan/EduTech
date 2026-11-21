
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ==========================================
// INTERFACES
// ==========================================

export interface ReferralCompany {
  id: number;
  company_name: string;
}

export interface ReferralJobRole {
  id: number;
  role_name: string;
}

export interface ReferralCountry {
  id: number;
  country_name: string;
}

export interface ReferralFormData {
  companies: ReferralCompany[];
  jobRoles: ReferralJobRole[];
  countries: ReferralCountry[];
}

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
  contributor_name: string;
  status: 'published' | 'archived';
  created_at: string;
}

export interface SubmitCareerReferral {
  company_id: number;
  job_role_id: number;
  country_id: number;
  job_link: string;
  referral_instructions: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  companies?: ReferralCompany[];
  jobRoles?: ReferralJobRole[];
  countries?: ReferralCountry[];
  referrals?: CareerReferral[];
}

// ==========================================
// MENTOR CAREER REFERRALS SERVICE
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class MentorCareerReferralsService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5000/api/mentor/career-hub';

  // ==========================================
  // GET REFERRAL FORM DATA
  // ==========================================

  getReferralFormData(): Observable<ApiResponse<never>> {

    return this.http.get<ApiResponse<never>>(
      `${this.apiUrl}/referrals/form-data`
    );

  }

  // ==========================================
  // SUBMIT CAREER REFERRAL
  // ==========================================

  submitCareerReferral(
    data: SubmitCareerReferral
  ): Observable<ApiResponse<never>> {

    return this.http.post<ApiResponse<never>>(
      `${this.apiUrl}/referrals`,
      data
    );

  }

  // ==========================================
  // GET CAREER REFERRALS
  // ==========================================

  getCareerReferrals(): Observable<ApiResponse<never>> {

    return this.http.get<ApiResponse<never>>(
      `${this.apiUrl}/referrals`
    );

  }

}
