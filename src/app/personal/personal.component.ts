import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http';
import { StudentService } from '../student.service'; // Import StudentService
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.css']
})
export class PersonalComponent {
  private apiUrl = 'http://localhost:3000/api/students';

  studentData = {
    student_name: '',
    dob: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    guardian_name: '',
    grade: ''
  };

  emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Basic email regex
  phonePattern = /^[0-9]{10}$/; // Indian phone number pattern

  isEmailValid(): boolean {
    return this.emailPattern.test(this.studentData.email);
  }

  isPhoneValid(): boolean {
    return this.phonePattern.test(this.studentData.phone);
  }
  

  constructor(private router: Router, private http: HttpClient, private studentService: StudentService) {}

  handleSubmit() {
    console.log('Submitting data:', this.studentData); // Log the data being sent

    if (this.isFormValid()) { // Validate the form
      this.http.post(this.apiUrl, this.studentData)
        .subscribe({
          next: (response) => {
            console.log('Data submitted successfully:', response);
            this.studentService.setStudentData(this.studentData); // Set the student data here
            
            // Determine the route based on the selected grade
            const dashboardRoute = this.getDashboardRoute(this.studentData.grade);
            if (dashboardRoute) {
              // Navigate to the corresponding grade dashboard
              this.router.navigate([dashboardRoute], {
                queryParams: {
                  name: this.studentData.student_name,
                  grade: this.studentData.grade
                }
              });
            }
          },
          error: (error) => {
            console.error('Error submitting data:', error);
          }
        });
    } else {
      console.error('Invalid email or phone number.'); // Error handling
    }
  }

  isFormValid(): boolean {
    // Check if required fields are filled and if email and phone are valid
    return this.studentData.student_name.trim() !== '' &&
           this.studentData.dob.trim() !== '' &&
           this.isEmailValid() &&
           this.isPhoneValid();
  }

  getDashboardRoute(grade: string): string | null {
    switch (grade) {
      case '9':
        return 'student-login/dashboard/grade-9';
      case '10':
        return 'student-login/dashboard/grade-10';
      case '11':
        return 'student-login/dashboard/grade-11';
      case '12':
        return 'student-login/dashboard/grade-12';
      default:
        console.error('Invalid grade selected');
        return null; // Return null for invalid grade
    }
  }
}
