import { Component, OnInit } from '@angular/core';
import { StudentserviceService, Student } from '../studentservice.service'; // Adjust import path accordingly
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-student-list',
  templateUrl: './studentlist.component.html',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./studentlist.component.css']
})
export class StudentlistComponent implements OnInit {
  students: Student[] = []; // Array to hold student data

  constructor(private studentService: StudentserviceService) {}

  ngOnInit(): void {
    this.students = this.studentService.getStudentData(); // Retrieve submitted students on initialization
  }
}
