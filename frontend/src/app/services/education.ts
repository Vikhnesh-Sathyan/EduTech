// Handles education configuration API communication

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Education {

  private apiUrl = 'http://localhost:5000/api/education';

  constructor(private http: HttpClient) {}

  // Get active education programs
  getPrograms() {
    return this.http.get(`${this.apiUrl}/programs`);
  }

  // Get active departments for a program
  getDepartments(programId: number) {
    return this.http.get(
      `${this.apiUrl}/departments/program/${programId}`
    );
  }

  // Get active education years for a department
  getYears(departmentId: number) {
    return this.http.get(
      `${this.apiUrl}/years/department/${departmentId}`
    );
  }

  // Get active subjects for an education year
getSubjects(yearId: number) {
  return this.http.get(
    `http://localhost:5000/api/student/subjects/available`
  );
}

}

