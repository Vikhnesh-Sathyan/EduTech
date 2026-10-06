// Handles mentor profile API communication

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Mentor {

  private apiUrl = 'http://localhost:5000/api/mentor';

  constructor(private http: HttpClient) {}

  // Get the logged-in mentor's profile
  getProfile() {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  // Save the logged-in mentor's profile
  saveProfile(data: {
    professional_title: string;
    specialization: string;
    bio: string;
    experience_years: number | null;
    skills: string;
    linkedin_url: string;
    github_url: string;
    availability_days: string;
    availability_start_time: string;
    availability_end_time: string;
  }) {
    return this.http.put(`${this.apiUrl}/profile`, data);
  }

  // Submit the mentor profile for admin verification
submitForVerification() {
  return this.http.put(
    `${this.apiUrl}/profile/submit`,
    {}
  );
}

// Get dashboard verification status
getDashboard() {
  return this.http.get(`${this.apiUrl}/dashboard`);
}
}
