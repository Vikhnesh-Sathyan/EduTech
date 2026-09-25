// USE:
// Handles API communication for admin department management.
// The service keeps HTTP communication separate from the page component.

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminDepartment {

  private apiUrl = 'http://localhost:5000/api/admin/departments';

  constructor(
    private http: HttpClient
  ) {}

// Get all departments for admin management
getDepartments() {
  return this.http.get(this.apiUrl);
}

  // Get all education departments
getDepartmentsByProgram(programId: number) {
  return this.http.get(
    `${this.apiUrl}/program/${programId}`
  );
}

  // Create a new department under an education program
  createDepartment(data: {
    education_program_id: number;
    name: string;
  }) {
    return this.http.post(
      this.apiUrl,
      data
    );
  }

}