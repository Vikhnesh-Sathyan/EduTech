import { Component } from '@angular/core';
import { MockInterviewService } from '../mock-interview.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-mock-interview',
  standalone: true,
  imports: [CommonModule, FormsModule,HttpClientModule],
  templateUrl: './mock-interview.component.html',
  styleUrls: ['./mock-interview.component.css'],
  providers: [MockInterviewService]
})
export class MockInterviewComponent {
  interviewType: string = '';
  question: string = '';
  questions: string[] = [];
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private mockInterviewService: MockInterviewService) {}

  // Start mock interview
  onStartMockInterview() {
    if (this.interviewType) {
      this.mockInterviewService.getMockInterviewQuestions(this.interviewType).subscribe({
        next: (data) => {
          this.questions = data.questions;
          this.errorMessage = '';
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Something went wrong.';
          this.questions = [];
        }
      });
    } else {
      this.errorMessage = 'Please select an interview type.';
    }
  }

  // Add a new question
  onAddQuestion() {
    if (this.interviewType && this.question) {
      this.mockInterviewService.addQuestion(this.interviewType, this.question).subscribe({
        next: (response: any) => {
          this.successMessage = 'Question added successfully!';
          this.errorMessage = '';
          this.question = ''; // Clear input field after successful submission
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to add question.';
          this.successMessage = '';
        }
      });
    } else {
      this.errorMessage = 'Please fill in both the question and the interview type.';
    }
  }
}
