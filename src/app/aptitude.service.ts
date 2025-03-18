// aptitude.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AptitudeService {

  private apiUrl = 'http://localhost:3000';  // Backend API URL

  constructor(private http: HttpClient) { }

  // Upload aptitude questions
  uploadAptitude(pdf: File, companyName: string): Observable<any> {
    const formData = new FormData();
    formData.append('pdf', pdf);
    formData.append('company_name', companyName);
    return this.http.post(`${this.apiUrl}/upload-aptitude`, formData);
  }

  // Fetch aptitude questions for a student based on company name
  getAptitudeQuestions(companyName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-aptitude/${companyName}`);
  }
}
