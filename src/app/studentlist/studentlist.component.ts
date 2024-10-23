import { Component, OnInit } from '@angular/core';
import { StudentserviceService, Student } from '../studentservice.service'; // Adjust import path accordingly
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './studentlist.component.html',
  styleUrls: ['./studentlist.component.css'],
  providers: [StudentserviceService]
})
export class StudentlistComponent implements OnInit {
  students: Student[] = []; // Local variable to hoald student data

  constructor(private studentService: StudentserviceService) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.studentService.fetchStudents().subscribe({
      next: (students) => {
        this.students = students; // Set the students data from the API
        console.log('Loaded students:', this.students); // Log the students array
      },
      error: (error) => {
        console.error('Error fetching students:', error); // Log any errors
      }
    });
  }
}
