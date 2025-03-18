// interview-insights.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InterviewInsightsService {

  private apiUrl = 'http://localhost:3000'; // Backend API URL

  constructor(private http: HttpClient) { }

  // Upload interview insights
  uploadInsights(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload-insights`, data);
  }

  // Get interview insights for a specific company
  getInsights(companyName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-insights/${companyName}`);
  }

  updateInsights(insight: any): Observable<any> {
    return this.http.put(`${this.apiUrl}`, insight); // Ensure the endpoint is correct
  }

  deleteInsights(companyName: string) {
    return this.http.delete(`/api/insights/${companyName}`); // Adjust the URL as necessary
  }
}
