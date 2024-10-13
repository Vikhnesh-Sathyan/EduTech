import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../authservice/authservice.component';
import { HttpClientModule, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { StudentserviceService, Student } from '../studentservice.service'; // Ensure correct path

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule], // Import necessary modules
  templateUrl: './dashboard.component.html', // Template for the component
  styleUrls: ['./dashboard.component.css'] // Styles for the component
})
export class DashboardComponent implements OnInit {
  studentData: Student = { // Initialize student data
    student_name: '',
    dob: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    guardian_name: '',
    grade: ''
  };

  name: string | undefined; // Variable for student name
  userProfileImg: string | undefined; // Variable for profile image
  unreadNotificationsCount: number = 0; // Count of unread notifications

  studentName: string | undefined; // Store student name from query params
  studentGrade: string | undefined; // Store student grade from query params

  uploadedFiles: { name: string; url: string; type: string }[] = []; // Array for uploaded files

  // Inject necessary services
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  private studentService = inject(StudentserviceService);

  constructor() {}

  ngOnInit(): void {
    this.loadUserData(); // Load user data on initialization
    this.getUnreadNotificationsCount(); // Fetch unread notifications count

    // Subscribe to query params to get student name and grade
    this.activatedRoute.queryParams.subscribe(params => {
      this.studentName = params['name'];
      this.studentGrade = params['grade'];
    });
  }

  // Load user data from session storage
  loadUserData(): void {
    const userData = sessionStorage.getItem("loggedInUser");

    if (userData) {
      const parsedData = JSON.parse(userData);
      this.name = parsedData.name; // Set the name from parsed data
      this.userProfileImg = parsedData.picture; // Set the profile image
    } else {
      console.error("No user data found in sessionStorage."); // Error handling
    }
  }

  // Sign out method
  signOut(): void {
    this.auth.signOut();
  }

  // Navigation methods for routing
  Extracurriculm(): void {
    this.router.navigate(['student-login/curriculum']);
  }

  notification(): void {
    this.router.navigate(['notifications']);
  }

  onProfileClick() {
    this.router.navigate(['/profile']);
  }

  navigateToProfile(): void {
    this.router.navigate(['profile']);
  }

  flashcard(): void {
    this.router.navigate(['flashcard']);
  }

  studentgenerated(): void {
    this.router.navigate(['studentgenerated']);
  }

  studytools(): void {
    this.router.navigate(['studytools']);
  }
  navigateToTodoList(): void {
    this.router.navigate(['todo-list']);
  }

  navigateToskillswap(): void {
    this.router.navigate(['user-profile']);
  }

  // Method to fetch unread notifications count from the server
  getUnreadNotificationsCount(): void {
    this.http.get<{ count: number }>('http://localhost:3000/api/notifications/unread-count').subscribe(
      (response) => {
        this.unreadNotificationsCount = response.count; // Set the unread notifications count
        console.log('Unread notifications count:', this.unreadNotificationsCount); // Log the count
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching unread notifications count', error); // Error handling
      }
    );
  }
}
