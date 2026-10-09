// Handles student profile API communication

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Profile {

  private apiUrl = 'http://localhost:5000/api/profile';

  constructor(private http: HttpClient) {}

  // Get the authenticated student's profile
  getProfile() {
    return this.http.get(`${this.apiUrl}`);
  }

  // Create or update the authenticated student's profile
saveProfile(data: {
  education_program_id: number;
  department_id: number;
  education_year_id: number;
  career_goal: string;
  learning_goals: string;
}) {
  return this.http.put(`${this.apiUrl}`, data);
}
}