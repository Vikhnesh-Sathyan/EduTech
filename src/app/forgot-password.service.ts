import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ForgotPasswordService {
  private apiUrl = 'http://localhost:3000/api/reset-password'; // Change this to your actual API endpoint

  constructor(private http: HttpClient) {}

  resetPassword(email: string, password: string): Observable<any> {
    return this.http.post(this.apiUrl, { email, newPassword: password, confirmPassword: password });
  }
}
