import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-teacher-register',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, ReactiveFormsModule],
  templateUrl: './teacher-register.component.html',
  styleUrls: ['./teacher-register.component.css'],
})
export class TeacherRegisterComponent {
  teacher = {
    name: '',
    email: '',
    qualification: '',
    resume: null as File | null,
    certification: null as File | null,
  };

  constructor(private http: HttpClient) {}

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (event.target.id === 'resume') {
      this.teacher.resume = file;
    } else if (event.target.id === 'certification') {
      this.teacher.certification = file;
    }
  }

  registerTeacher() {
    const formData = new FormData();
    formData.append('name', this.teacher.name);
    formData.append('email', this.teacher.email);
    formData.append('qualification', this.teacher.qualification);

    if (this.teacher.resume) {
      formData.append('resume', this.teacher.resume);
    }
    if (this.teacher.certification) {
      formData.append('certification', this.teacher.certification);
    }

    this.http.post('http://localhost:3000/api/teacher/register', formData).subscribe(
      (response: any) => {
        alert(response.message); // Success message
      },
      (error) => {
        console.error('Error:', error); // Error handling
      }
    );
  }
}
