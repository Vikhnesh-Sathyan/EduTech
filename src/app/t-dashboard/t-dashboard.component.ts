import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService, Student } from '../student.service'; // Import the StudentService and Student model

@Component({
  selector: 'app-t-dashboard',
  templateUrl: './t-dashboard.component.html',
  styleUrls: ['./t-dashboard.component.css']
})
export class TDashboardComponent implements OnInit {
  darkMode: boolean = false; // Default dark mode is off
  students: Student[] = [];  // To hold the list of students

  constructor(private router: Router, private studentService: StudentService) {}

  // Toggle dark mode
  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
  }
  navigateToProfile()
  {
    this.router.navigate(['profile']);
  }
  // Navigate to the resources page
  goToResources(): void {
    this.router.navigate(['resources']);
  }
  onMessageClick() {
    console.log('Messages button clicked');
    // Navigate to messages page programmatically
    this.router.navigate(['messages']);
  }
  // Navigate to the student list page
  studentList(): void {
    this.router.navigate(['studentlist']);
  }
  goToStudytips(): void {
    this.router.navigate(['study-tips']);
  }
  // Fetch the list of students when the component loads
  ngOnInit(): void {
    const studentData = this.studentService.getStudentData();
    this.students = Array.isArray(studentData) ? studentData : studentData ? [studentData] : [];

    if (!this.students.length) {
      console.error('No student data found');
    }
  }
}
