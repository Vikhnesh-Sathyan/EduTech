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

  constructor(private router: Router, private studentService: StudentService) {}  // Inject both Router and StudentService

  // Toggle dark mode
  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
  }

  // Navigate to the resources page
  goToResources(): void {
    this.router.navigate(['resources']);
  }

  // Navigate to the student list page
  studentlist(): void {
    this.router.navigate(['studentlist']);
  }

  // Fetch the list of students when the component loads
  ngOnInit(): void {
    const studentData = this.studentService.getStudentData();
    if (studentData) {
      this.students = [studentData];  // Assuming a single student data, add it to the students array
    } else {
      console.error('No student data found');
    }
  }
}
