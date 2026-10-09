// USE:
// Handles API communication for admin education year management.
// The service keeps HTTP communication separate from the page component.

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminEducationYear {

  private apiUrl =
    'http://localhost:5000/api/admin/education-years';

  constructor(private http: HttpClient) {}

  // Get all education years for admin management
  getEducationYears() {
    return this.http.get(this.apiUrl);
  }

  // Get education years for a specific department
  getEducationYearsByDepartment(
    departmentId: number
  ) {
    return this.http.get(
      `${this.apiUrl}/department/${departmentId}`
    );
  }

  // Create a new education year
  createEducationYear(data: {
    department_id: number;
    name: string;
    year_order: number;
  }) {
    return this.http.post(
      this.apiUrl,
      data
    );
  }

  // Update an existing education year
  updateEducationYear(
    id: number,
    data: {
      name: string;
      year_order: number;
    }
  ) {
    return this.http.put(
      `${this.apiUrl}/${id}`,
      data
    );
  }

  // Change the active/inactive status of an education year
  updateEducationYearStatus(
    id: number,
    status: 'active' | 'inactive'
  ) {
    return this.http.patch(
      `${this.apiUrl}/${id}/status`,
      { status }
    );
  }
}