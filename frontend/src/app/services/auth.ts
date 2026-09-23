// Handles authentication API communication between Angular and the backend

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private apiUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) {}

  // Register a new student
  register(data: {
    name: string;
    email: string;
    password: string;
  }) {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // Login an existing user
  login(data: {
    email: string;
    password: string;
  }) {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  // Get the currently logged-in user's information
getMe() {
  return this.http.get(`${this.apiUrl}/me`);
}

// Logs out the current user
logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

}