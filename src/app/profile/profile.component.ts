import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService } from '../student.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  studentData: any; // Store student data

  constructor(private router: Router, private studentService: StudentService) {}

  ngOnInit() {
    this.studentData = this.studentService.getStudentData();
    console.log('Retrieved student data:', this.studentData); // Debug log
    if (!this.studentData || !this.studentData.student_name) {
      console.error('No student data found or student data is incomplete');
    } else {
      console.log('Student data loaded:', this.studentData);
    }
  }
  

  goBack() {
    this.router.navigate(['/student-login']);
  }
}
