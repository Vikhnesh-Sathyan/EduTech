import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http';
// Import FormsModule for template-driven forms

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [FormsModule,HttpClientModule], // Include FormsModule
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.css']
})
export class PersonalComponent {
  private apiUrl = 'http://localhost:3000/api/students';

  // Object to store form data
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


  constructor(private router: Router, private http: HttpClient) {}

  handleSubmit() {
    console.log('Submitting data:', this.studentData); // Log the data being sent
    this.http.post(this.apiUrl, this.studentData)
      .subscribe(response => {
        console.log('Data submitted successfully:', response);
        this.router.navigate(['/student-login/dashboard']); // Navigate after successful submission
      }, error => {
        console.error('Error submitting data:', error);
      });
}
  
}
