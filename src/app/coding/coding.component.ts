import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Import Router for navigation
import { QuestionService } from '../question.service'; // Import your service

@Component({
  selector: 'app-coding',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './coding.component.html',
  styleUrls: ['./coding.component.css'],
  providers: [QuestionService], // Register the service
})
export class CodingComponent implements OnInit {
  questions: any[] = []; // Store all questions
  filteredQuestions: any[] = []; // Store filtered questions
  selectedLevel: string = ''; // Store selected difficulty level

  constructor(
    private questionService: QuestionService, // Inject service
    private router: Router // Inject router
  ) {}

  ngOnInit() {
    // Load all questions initially
    this.loadQuestions();
  }

  // Load questions with optional level filter
  loadQuestions(level: string = '') {
    console.log('Fetching questions with level:', level); // Debug log

    this.questionService.getQuestions(level).subscribe(
      (data) => {
        console.log('Received questions:', data); // Debug log
        this.questions = data;
        this.filterQuestions(); // Filter questions based on selected level
      },
      (error) => {
        console.error('Error fetching questions:', error); // Error handling
      }
    );
  }

  // Filter questions based on selected difficulty level
  filterQuestions() {
    if (this.selectedLevel) {
      this.filteredQuestions = this.questions.filter(
        (q) => q.difficulty_level === this.selectedLevel
      );
    } else {
      this.filteredQuestions = this.questions; // Show all questions if no level selected
    }

    console.log('Filtered questions:', this.filteredQuestions); // Debug log
  }

  // Disable copying answers by preventing right-click
  disableCopy(event: MouseEvent) {
    event.preventDefault();
    alert('Copying answers is not allowed.');
  }

  // Navigate to code editor with query parameters
  navigateToCodeEditor(question: any) {
    this.router.navigate(['/code-editor'], {
      queryParams: {
        questionText: question.question_text,
        difficulty: question.difficulty_level,
      },
    });
  }
}
