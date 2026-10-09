// Handles admin mentor verification API communication

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminMentor {

  private apiUrl = 'http://localhost:5000/api/admin/mentors';

  // Get mentors waiting for verification
  getPendingMentors() {
    return this.http.get(`${this.apiUrl}/pending`);
  }

  // Approve a mentor
  approveMentor(mentorId: number) {
    return this.http.put(
      `${this.apiUrl}/${mentorId}/approve`,
      {}
    );
  }

  // Reject a mentor
  rejectMentor(
    mentorId: number,
    verification_note: string
  ) {
    return this.http.put(
      `${this.apiUrl}/${mentorId}/reject`,
      { verification_note }
    );
  }

  constructor(private http: HttpClient) {}
}