// skill-swap.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SkillSwapService {
  private apiUrl = 'http://localhost:3000/api/profiles'; // Ensure this URL is correct

  constructor(private http: HttpClient) {}

  // Fetch profiles from backend
  getProfiles(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Save a new profile
  saveProfile(profileData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, profileData);
  }
}
