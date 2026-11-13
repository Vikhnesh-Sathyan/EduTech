
import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  DailyQuizResult,
  StudentDailyQuizService
} from '../../../../services/student/daily-quiz/student-daily-quiz.service';

@Component({
  selector: 'app-daily-quiz-result',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './daily-quiz-result.html',
  styleUrl: './daily-quiz-result.css'
})
export class DailyQuizResultComponent implements OnInit {

  result = signal<DailyQuizResult | null>(null);

  loading = signal(false);
  errorMessage = signal('');

  constructor(
    private dailyQuizService: StudentDailyQuizService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const quizId = Number(
      this.route.snapshot.paramMap.get('quizId')
    );

    if (!Number.isInteger(quizId) || quizId <= 0) {
      this.errorMessage.set('Invalid quiz ID.');
      return;
    }

    this.loadResult(quizId);
  }

  loadResult(quizId: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.dailyQuizService.getQuizResult(quizId).subscribe({

      next: response => {
        this.result.set(response.result);
        this.loading.set(false);
      },

      error: error => {
        this.errorMessage.set(
          error.error?.message || 'Unable to load your quiz result.'
        );

        this.loading.set(false);
      }

    });
  }

  get percentage(): number {
    const result = this.result();

    if (!result || result.total_questions === 0) {
      return 0;
    }

    return Math.round(
      (result.correct_answers / result.total_questions) * 100
    );
  }

}
