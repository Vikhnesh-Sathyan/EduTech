import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../authservice/authservice.component'; 
import { HttpClientModule, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { StudentserviceService, Student } from '../studentservice.service'; // Ensure correct path

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  
  // For handling student data (Form Submission)
  studentData: Student = {
    student_name: '',
    dob: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    guardian_name: '',
    grade: ''
  };

  // To manage user profile and notifications
  name: string | undefined;
  userProfileImg: string | undefined;
  unreadNotificationsCount: number = 0;

  // New properties to hold the parameters
  studentName: string | undefined;
  studentGrade: string | undefined;

  // Inject dependencies
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute); // For query parameters
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  private studentService = inject(StudentserviceService); // Inject StudentService

  constructor() {}

  // Called when the component is initialized
  ngOnInit(): void {
    this.loadUserData();
    this.getUnreadNotificationsCount();
    
    // Subscribe to the query parameters
    this.activatedRoute.queryParams.subscribe(params => {
      this.studentName = params['name']; // Get the student's name
      this.studentGrade = params['grade']; // Get the student's grade
    });
  }

  // Method to load user data from sessionStorage
  loadUserData(): void {
    const userData = sessionStorage.getItem("loggedInUser");

    if (userData) {
      const parsedData = JSON.parse(userData);
      this.name = parsedData.name; 
      this.userProfileImg = parsedData.picture; 
    } else {
      console.error("No user data found in sessionStorage.");
    }
  }

  // Handle form submission to store student data
  handleSubmit(): void {
    this.studentService.setStudentData(this.studentData); // Corrected method name
    this.resetForm(); // Reset the form after submission
  }

  // Reset form to clear the student details after submission
  resetForm(): void {
    this.studentData = {
      student_name: '',
      dob: '',
      gender: '',
      email: '',
      phone: '',
      address: '',
      guardian_name: '',
      grade: ''
    };
  }

  // Sign out method
  signOut(): void {
    this.auth.signOut();
  }

  // Navigate to Extracurricular activities page
  Extracurriculm(): void {
    this.router.navigate(['student-login/curriculum']);
  }

  // Navigate to Notifications page
  notification(): void {
    this.router.navigate(['notifications']);
  }

  onProfileClick() {
    // Navigate to the profile page
    this.router.navigate(['/profile']); // Adjust the route as necessary
  }

  // Navigate to Profile page
  navigateToProfile(): void {
    this.router.navigate(['profile']);
  }

  resourcelink(): void {
    this.router.navigate(['resourcelink']);
  }

  studentgenerated(): void {
    this.router.navigate(['studentgenerated']);
  }

  navigateToskillswap(): void {
    this.router.navigate(['user-profile']); // Correctly navigates to the User Profile page
  }

  // Fetch unread notifications count from the server
  getUnreadNotificationsCount(): void {
    this.http.get('http://localhost:3000/api/notifications/unread-count').subscribe(
      (response: any) => {
        this.unreadNotificationsCount = response.count;
        console.log('Unread notifications count:', this.unreadNotificationsCount);
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching unread notifications count', error);
      }
    );
  }
}