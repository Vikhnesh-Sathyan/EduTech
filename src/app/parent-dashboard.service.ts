// parent-dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParentDashboardService {

  private apiUrl = 'http://localhost:3000/api/parent/students';

  constructor(private http: HttpClient) {}

  // Fetch students for the logged-in parent
  getStudents(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
