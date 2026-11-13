import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { RouterLink } from '@angular/router';

import {
  StudentDailyQuiz,
  StudentDailyQuizService
} from '../../../../services/student/daily-quiz/student-daily-quiz.service';

@Component({
  selector: 'app-daily-quiz-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './daily-quiz-dashboard.html',
  styleUrl: './daily-quiz-dashboard.css'
})
export class DailyQuizDashboard implements OnInit {

  quiz = signal<StudentDailyQuiz | null>(null);

  loading = signal(false);
  errorMessage = signal('');

  constructor(
    private dailyQuizService: StudentDailyQuizService
  ) {}

  ngOnInit(): void {
    this.loadDailyQuiz();
  }

  loadDailyQuiz(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.dailyQuizService.getDashboard().subscribe({

      next: (response) => {
        this.quiz.set(response.quiz || null);
        this.loading.set(false);
      },

      error: (error) => {
        this.errorMessage.set(
          error.error?.message ||
          "Failed to load today's Daily Quiz."
        );

        this.loading.set(false);
      }

    });
  }
}
