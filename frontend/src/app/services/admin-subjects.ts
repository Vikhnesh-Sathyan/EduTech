// USE:
// Handles API communication for admin subject management.
// The service keeps HTTP communication separate from the page component.

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminSubject {

  private apiUrl =
    'http://localhost:5000/api/admin/subjects';

  constructor(private http: HttpClient) {}

  // Get all subjects for admin management
  getSubjects() {
    return this.http.get(this.apiUrl);
  }

  // Get subjects for a specific education year
  getSubjectsByYear(yearId: number) {
    return this.http.get(
      `${this.apiUrl}/year/${yearId}`
    );
  }

  // Create a new subject
  createSubject(data: {
    education_year_id: number;
    name: string;
    description: string;
  }) {
    return this.http.post(
      this.apiUrl,
      data
    );
  }

  // Update an existing subject
  updateSubject(
    id: number,
    data: {
      name: string;
      description: string;
    }
  ) {
    return this.http.put(
      `${this.apiUrl}/${id}`,
      data
    );
  }

  // Change the active/inactive status of a subject
  updateSubjectStatus(
    id: number,
    status: 'active' | 'inactive'
  ) {
    return this.http.patch(
      `${this.apiUrl}/${id}/status`,
      { status }
    );
  }
}