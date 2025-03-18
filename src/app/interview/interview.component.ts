import { Component } from '@angular/core';
import { MockInterviewService } from '../mock-interview.service';  // Make sure to import the service
import { CommonModule } from '@angular/common';
import { MockInterviewComponent } from '../mock-interview/mock-interview.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-interview',
  standalone: true,
  imports: [CommonModule,HttpClientModule],
  templateUrl: './interview.component.html',
  styleUrl: './interview.component.css',
  providers:[MockInterviewService]
})
export class InterviewComponent {

  questions: string[] = []; // Store the fetched questions
  errorMessage: string = ''; // Handle errors

  constructor(private mockInterviewService: MockInterviewService) {}

  // Handle interview type change
  changeInterviewType(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const interviewType = selectElement.value;
  
    if (interviewType) {
      this.mockInterviewService.getMockInterviewQuestions(interviewType).subscribe({
        next: (data) => {
          this.questions = data.questions || []; // Safeguard for undefined data
          this.errorMessage = '';
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to load questions. Please try again later.';
          this.questions = [];
        }
      });
    } else {
      this.questions = [];
      this.errorMessage = 'Please select an interview type.';
    }
  }
  

  // Fetch questions from the backend API
  fetchMockInterviewQuestions(type: string) {
    this.mockInterviewService.getMockInterviewQuestions(type).subscribe({
      next: (data) => {
        this.questions = data.questions; // Populate the questions
        this.errorMessage = ''; // Clear error message
      },
      error: (err) => {
        this.errorMessage = 'Failed to load questions. Please try again later.';
        this.questions = []; // Clear questions if there’s an error
      },
    });
  }

}
