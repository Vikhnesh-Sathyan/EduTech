import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../authservice/authservice.component'; 
import { HttpClientModule, HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);
  private http = inject(HttpClient);

  name: string | undefined;
  userProfileImg: string | undefined;
  unreadNotificationsCount: number = 0;

  ngOnInit() {
    const userData = sessionStorage.getItem("loggedInUser");

    if (userData) {
      const parsedData = JSON.parse(userData);
      this.name = parsedData.name; 
      this.userProfileImg = parsedData.picture; 
    } else {
      console.error("No user data found in sessionStorage.");
    }

    this.getUnreadNotificationsCount();
  }

  signOut() {
    this.auth.signOut();
  }

  Extracurriculm() {
    this.router.navigate(['student-login/curriculum']);
  }

  notification() {
    this.router.navigate(['notifications']);
  }

  navigateToProfile(): void {
    this.router.navigate(['profile']);
  }

  getUnreadNotificationsCount() {
    this.http.get('http://localhost:3000/api/notifications/unread-count').subscribe(
      (count: any) => {
        this.unreadNotificationsCount = count.count;
        console.log('Unread notifications count:', this.unreadNotificationsCount);
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching unread notifications count', error);
        // Optionally show an error message to the user
      }
    );
  }
}
