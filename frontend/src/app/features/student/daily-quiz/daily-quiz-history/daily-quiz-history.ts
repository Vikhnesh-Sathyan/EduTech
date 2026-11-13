
import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  DailyQuizHistoryItem,
  StudentDailyQuizService
} from '../../../../services/student/daily-quiz/student-daily-quiz.service';

@Component({
  selector: 'app-daily-quiz-history',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './daily-quiz-history.html',
  styleUrl: './daily-quiz-history.css'
})
export class DailyQuizHistory implements OnInit {

  history = signal<DailyQuizHistoryItem[]>([]);

  totalQuizzes = signal(0);
  completedQuizzes = signal(0);
  pendingQuizzes = signal(0);

  loading = signal(false);
  errorMessage = signal('');

  constructor(
    private dailyQuizService: StudentDailyQuizService
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.dailyQuizService.getQuizHistory().subscribe({
      next: response => {
        this.history.set(response.history || []);

        this.totalQuizzes.set(response.total_quizzes || 0);
        this.completedQuizzes.set(response.completed_quizzes || 0);
        this.pendingQuizzes.set(response.pending_quizzes || 0);

        this.loading.set(false);
      },

      error: error => {
        this.errorMessage.set(
          error.error?.message || 'Unable to load quiz history.'
        );

        this.loading.set(false);
      }
    });
  }
}
