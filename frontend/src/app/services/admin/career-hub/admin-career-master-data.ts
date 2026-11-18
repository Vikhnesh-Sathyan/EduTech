
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminCareerMasterData {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5000/api/admin/career-hub/master-data';

  // GET ALL MASTER DATA
  getMasterData(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // COMPANIES
  createCompany(data: { company_name: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/companies`, data);
  }

  updateCompany(id: number, data: { company_name: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/companies/${id}`, data);
  }

  toggleCompanyStatus(id: number, is_active: number): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/companies/${id}/status`,
      { is_active }
    );
  }

  // JOB ROLES
  createJobRole(data: { role_name: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/job-roles`, data);
  }

  updateJobRole(id: number, data: { role_name: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/job-roles/${id}`, data);
  }

  toggleJobRoleStatus(id: number, is_active: number): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/job-roles/${id}/status`,
      { is_active }
    );
  }

  // COUNTRIES
  createCountry(data: {
    country_name: string;
    country_code: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/countries`, data);
  }

  updateCountry(
    id: number,
    data: { country_name: string; country_code: string }
  ): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/countries/${id}`, data);
  }

  toggleCountryStatus(id: number, is_active: number): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/countries/${id}/status`,
      { is_active }
    );
  }
}
