import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  AdvancedTheoryQuiz,
  AdvancedTheoryQuizService
} from '../../../../services/mentor/advanced/advanced-theory-quiz.service';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quiz-list.html',
  styleUrl: './quiz-list.css'
})
export class QuizList implements OnInit {
  quizzes = signal<AdvancedTheoryQuiz[]>([]);
  loading = signal(true);
  errorMessage = signal('');

  constructor(
    private quizService: AdvancedTheoryQuizService
  ) {}

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.quizService.getMyQuizzes().subscribe({
      next: (response) => {
        this.quizzes.set(response.quizzes ?? []);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.message || 'Failed to load your quizzes.'
        );
        this.loading.set(false);
      }
    });
  }

  get draftCount(): number {
    return this.quizzes().filter(
      quiz => quiz.status.toLowerCase() === 'draft'
    ).length;
  }

  get publishedCount(): number {
    return this.quizzes().filter(
      quiz => quiz.status.toLowerCase() === 'published'
    ).length;
  }

  trackByQuizId(
    index: number,
    quiz: AdvancedTheoryQuiz
  ): number {
    return quiz.id;
  }
}