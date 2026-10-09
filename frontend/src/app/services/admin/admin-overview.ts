// Handles admin dashboard overview API communication

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminOverview {

  private apiUrl = 'http://localhost:5000/api/admin/overview';

  constructor(private http: HttpClient) {}

  getOverview() {
    return this.http.get(`${this.apiUrl}`);
  }
}