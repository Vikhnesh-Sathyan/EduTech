import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'; // Import the Router

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

  // Single constructor combining both HttpClient and Router
  constructor(private http: HttpClient, private router: Router) {}

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

        // Navigate to the music course page after submission
        this.router.navigate(['/musiccourse']);
      },
      (error) => {
        console.error('Error submitting application:', error);
        alert('There was an error submitting your application. Please try again later.');
      }
    );
  }
}
