import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { CommonModule } from '@angular/common'; // Import CommonModule

interface Student {
  student_name: string;
  dob: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  guardian_name: string;
  grade: number;
}

@Component({
  selector: 'app-studentlist',
  standalone: true,
  imports: [FormsModule, CommonModule], // Include CommonModule here
  templateUrl: './studentlist.component.html',
  styleUrls: ['./studentlist.component.css']
})
export class StudentlistComponent {
  students: Student[] = []; // Store the list of students
  studentData: Student = { // Initial student data structure
    student_name: '',
    dob: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    guardian_name: '',
    grade: 0
  };

  handleSubmit(): void {
    this.students.push({ ...this.studentData }); // Push the new student data to the array
    this.resetForm(); // Reset the form after submission
  }

  resetForm(): void {
    this.studentData = { // Reset the studentData object
      student_name: '',
      dob: '',
      gender: '',
      email: '',
      phone: '',
      address: '',
      guardian_name: '',
      grade: 0
    };
  }
}
