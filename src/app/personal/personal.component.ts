import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Define the interface for the Student type
interface Student {
  studentId: string;
  studentName: string;
  dob: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  nationality: string;
  department: string;
  program: string;
  year: string;
}

@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.css']
})
export class PersonalComponent implements OnInit {
  student: Student = {
    studentId: '',
    studentName: '',
    dob: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    nationality: '',
    department: '',
    program: '',
    year: ''
  };

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser') || '{}');
    if (loggedInUser && loggedInUser.id) {
      this.http.get<Student>(`${this.apiUrl}/get-personal-info/${loggedInUser.id}`)
        .subscribe(data => {
          this.student = data; // Populate student data if available
        }, error => {
          console.error('Error fetching personal info:', error);
        });
    }
  }

  onSubmit() {
    this.http.put(`${this.apiUrl}/update-personal-info`, { ...this.student, userId: this.student.studentId })
      .subscribe(response => {
        alert('Personal information updated successfully!');
      }, error => {
        console.error('Error updating personal info:', error);
      });
  }
}
