// USE:
// Handles API communication for the admin Education Programs page.
// It allows the admin frontend to load, create, update, and manage education programs mca,1,subjects.

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminEducationProgram {

  private apiUrl =
    'http://localhost:5000/api/admin/education-programs';

  constructor(private http: HttpClient) {}

  // Load all education programs for the admin
  getPrograms() {
    return this.http.get(this.apiUrl);
  }

  // Create a new education program
  createProgram(data: {
    name: string;
    description: string;
  }) {
    return this.http.post(this.apiUrl, data);
  }

  // Update an existing education program
  updateProgram(
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

  // Change the active/inactive status of a program
  updateProgramStatus(
    id: number,
    status: 'active' | 'inactive'
  ) {
    return this.http.patch(
      `${this.apiUrl}/${id}/status`,
      { status }
    );
  }
}