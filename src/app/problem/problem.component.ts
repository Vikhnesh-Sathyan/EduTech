import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-problem',
  standalone: true,
  imports: [MatCardModule, CommonModule, FormsModule, HttpClientModule],
  templateUrl: './problem.component.html',
  styleUrls: ['./problem.component.css'],
})
export class ProblemComponent implements OnInit {
  problems = [];
  newProblem = {
    title: '',
    description: '',
    company: '',
    difficulty: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Fetch all problems from the backend when the component is initialized
    this.getProblems();
  }

  // Fetch problems from the backend
  getProblems() {
    this.http.get('http://localhost:3000/api/problems').subscribe(
      (response: any) => {
        this.problems = response;
      },
      (error) => {
        console.error('Error fetching problems:', error);
      }
    );
  }

  // Add a new problem to the backend
  addProblem() {
    if (this.newProblem.title && this.newProblem.description) {
      this.http.post('http://localhost:3000/api/problems', this.newProblem).subscribe(
        (response) => {
          console.log('Problem added successfully:', response);
          this.getProblems(); // Refresh the problem list
          this.newProblem = { title: '', description: '', company: '', difficulty: '' };
        },
        (error) => {
          console.error('Error adding problem:', error);
        }
      );
    } else {
      alert('Please fill in both title and description.');
    }
  }
}
