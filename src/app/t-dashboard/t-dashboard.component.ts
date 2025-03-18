import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { StudentService, Student } from '../student.service'; // Import the StudentService and Student model

@Component({
  selector: 'app-t-dashboard',
  templateUrl: './t-dashboard.component.html',
  styleUrls: ['./t-dashboard.component.css']
})
export class TDashboardComponent implements OnInit {
  darkMode: boolean = false; // Default dark mode is off
  students: Student[] = [];  // To hold the list of students
  teacherStatus: string = ''; // To store the teacher's approval status

  constructor(private router: Router, 
              private studentService: StudentService, 
              private http: HttpClient) {}

  // Toggle dark mode
  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
  }

  // Navigate to profile
  navigateToProfile() {
    this.router.navigate(['profile']);
  }

  // Navigate to the resources page
  goToResources(): void {
    this.router.navigate(['resources']);
  }

  // Navigate to messages page
  onMessageClick() {
    console.log('Messages button clicked');
    this.router.navigate(['messages']);
  }

  // Navigate to student list page
  studentList(): void {
    this.router.navigate(['studentlist']);
  }

  // Navigate to study tips page
  goToStudytips(): void {
    this.router.navigate(['study-tips']);
  }

  // Navigate to question generation page
  navigateTogeneratequestion(): void {
    this.router.navigate(['generate-question']);
  }
  
  // Navigate to teacher review page
  navigateToBankSubmission(): void {
    this.router.navigate(['teacher-review']); // Adjust the route as necessary
  }

  // Fetch the list of students and check teacher's approval status on component load
  ngOnInit(): void {
    // Fetch student data
    const studentData = this.studentService.getStudentData();
    this.students = Array.isArray(studentData) ? studentData : studentData ? [studentData] : [];

    if (!this.students.length) {
      console.error('No student data found');
    }

    // Check teacher's approval status
    this.checkTeacherStatus();
  }

  // Check if the teacher is approved
  checkTeacherStatus() {
    this.http.get<any>('http://localhost:3000/api/teacher/status').subscribe(
      (data) => {
        this.teacherStatus = data.status;
        if (this.teacherStatus !== 'approved') {
          this.router.navigate(['/pending']);
        }
      },
      (error) => {
        console.error('Error checking teacher status:', error);
        this.router.navigate(['/pending']);
      }
    );
  }
}
