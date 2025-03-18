import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-shortlisted-officer',
  standalone: true,
  imports: [FormsModule,HttpClientModule],
  templateUrl: './shortlisted-officer.component.html',
  styleUrl: './shortlisted-officer.component.css'
})
export class ShortlistedOfficerComponent {
  student = {
    student_id: '', // Match backend field names exactly
    student_name: '',
    branch: '',
    company_name: '',
    job_title: '',
    next_round_name: '',
    next_round_date: ''
  };
  
  constructor(private http: HttpClient) {}

  addShortlistedStudent() {
    console.log('Sending student data:', this.student); // Debugging log

    this.http.post('http://localhost:3000/api/shortlisted-students', this.student).subscribe(
      (response) => {
        console.log('Success:', response);
        alert('Shortlisted student details added successfully!');
      },
      (error) => {
        console.error('Error:', error);
        alert('Failed to add shortlisted student details. Please check the console for details.');
      }
    );
  }
  
  
  
  
  
}
