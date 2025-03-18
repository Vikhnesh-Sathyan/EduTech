import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../authservice/authservice.component';
import { HttpClientModule, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { StudentserviceService, Student } from '../studentservice.service'; // Ensure correct path

@Component({ 
  selector: 'app-grade-9-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './grade-9-dashboard.component.html',
  styleUrls: ['./grade-9-dashboard.component.css'],// Correct property name
  providers:[StudentserviceService]
})
export class Grade9DashboardComponent implements OnInit {
  // Initialize student data object
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
  currentDate: Date = new Date(); // Initialize with the current date

  name: string | undefined;
  userProfileImg: string | undefined;
  unreadNotificationsCount: number = 0;
  studentName: string | undefined;
  studentGrade: string | undefined;

  uploadedFiles: { name: string; url: string; type: string }[] = [];
  yourSkills: string[] = ['Math', 'Science', 'Coding']; // Example skills
  availableSwaps: { studentName: string; skill: string }[] = [];

  // Inject necessary services
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  private studentService = inject(StudentserviceService);

  constructor() {}

  // Initialize component data
  ngOnInit(): void {
    this.loadUserData();
    this.getUnreadNotificationsCount();
    this.loadAvailableSwaps();

    // Subscribe to query params for student name and grade
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
      this.name = parsedData.name;
      this.userProfileImg = parsedData.picture;
    } else {
      console.error("No user data found in sessionStorage.");
    }
  }

  // Sign out method
  signOut(): void {
    this.auth.signOut();
  }

  // Fetch unread notifications count from the server
  getUnreadNotificationsCount(): void {
    this.http.get<{ count: number }>('http://localhost:3000/api/notifications/unread-count').subscribe(
      (response) => {
        this.unreadNotificationsCount = response.count;
        console.log('Unread notifications count:', this.unreadNotificationsCount);
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching unread notifications count', error);
      }
    );
  }

  // Load available skill swaps (mock data for demo purposes)
  loadAvailableSwaps(): void {
    this.availableSwaps = [
      { studentName: 'Alice', skill: 'Music' },
      { studentName: 'Bob', skill: 'Art' },
      { studentName: 'Charlie', skill: 'French' }
    ];
  }

  // Handle skill swap request
  requestSkillSwap(swap: { studentName: string; skill: string }): void {
    console.log(`Requested swap with ${swap.studentName} for skill: ${swap.skill}`);
    alert(`Skill swap request sent to ${swap.studentName} for ${swap.skill}.`);
  }

  // Navigation methods
  Extracurriculm(): void {
    this.router.navigate(['student-login/curriculum']);
  }
  tips(): void {
    this.router.navigate(['tips']);
  }
  notification(): void {
    this.router.navigate(['notifications']);
  }

  onProfileClick(): void {
    this.router.navigate(['/profile']);
  }
  navigateTomessages(): void {
    this.router.navigate(['student-messages']);
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
  navigateToCodeEditor(): void {
    this.router.navigate(['code-editor']); // Navigate to code editor route
  }

  navigateToCoding(): void {
    this.router.navigate(['Coding']); 
  }
  navigateToQuestionbank(): void {
    this.router.navigate(['student-submission']); 
  }
  updateDate(): void {
    setInterval(() => {
      this.currentDate = new Date();
    }, 24 * 60 * 60 * 1000); // Every 24 hours
  }
}
