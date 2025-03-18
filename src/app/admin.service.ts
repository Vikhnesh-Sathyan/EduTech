import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators'; // Import tap
import { Router } from '@angular/router'; // Import Router for navigation

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = 'http://localhost:3000'; // Replace with your backend API URL

  constructor(private http: HttpClient, private router: Router) {} // Inject Router

  // Fetch user details after login
  login(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, user).pipe(
      tap((response: any) => {
        if (response.isApproved) {
          if (response.role === 'Student') {
            this.router.navigate(['/student-dashboard']);
          } else if (response.role === 'Placement Officer') {
            this.router.navigate(['/placement-dashboard']);
          }
        } else {
          alert('Your account is pending admin approval.');
        }
      })
    );
  }

  // Fetch pending approvals
  getPendingApprovals(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pending-approvals`);
  }

  // Approve or reject a user
  approveUser(userId: number, isApproved: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/approve-user`, { userId, isApproved });
  }
}
