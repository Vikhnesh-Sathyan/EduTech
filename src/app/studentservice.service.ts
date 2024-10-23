import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Student {
  student_name: string;
  dob: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  guardian_name: string;
  grade: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentserviceService {
  private apiUrl = 'http://localhost:3000/api/students'; // Your API endpoint

  constructor(private http: HttpClient) {}

  // Fetch students from the API
  fetchStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.apiUrl);
  }
}
