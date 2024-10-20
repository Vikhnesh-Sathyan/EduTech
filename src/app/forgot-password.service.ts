import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'  // Ensure this service is available globally
})
export class ForgotPasswordService {
  email: string = '';  // Initialize the email property
  message: string = '';  // Initialize the message property

  constructor(private http: HttpClient) {}

  // Define the API endpoint and use HttpClient to send requests
  resetPassword(email: string, newPassword: string): Observable<any> {
    const payload = { email, newPassword };
    return this.http.post('/api/reset-password', payload);  // Replace with your actual API endpoint
  }
}
