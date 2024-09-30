import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-music',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './music.component.html',
  styleUrls: ['./music.component.css']
})
export class MusicComponent {
  student = {
    name: '',
    email: '',
    course: '',
    experience: 'beginner',
    class: '',
    notes: ''
  };

  courses = [
    { name: 'Piano' },
    { name: 'Guitar' },
    { name: 'Violin' },
    { name: 'Drums' },
    { name: 'Voice' }
  ];

  constructor(private http: HttpClient) {}

  // Handle form submission
  onSubmit() {
    console.log('Student Application:', this.student);
  
    this.http.post('http://localhost:3000/api/music', this.student).subscribe(
      (response: any) => {
        console.log('Response from server:', response);
        alert(`Application submitted for ${this.student.name} to join the ${this.student.course} course!`);
        
        // Reset the form after submission
        this.student = {
          name: '',
          email: '',
          course: '',
          experience: 'beginner',
          class: '',
          notes: ''
        };
      },
      (error) => {
        console.error('Error submitting application:', error);
        alert('There was an error submitting your application. Please try again later.');
      }
    );
  }
}
