import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import {
  StudentTheoryQuizService
} from '../../../../../services/student/advanced/student-theory-quiz.service';

@Component({
  selector: 'app-student-theory-quiz-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quiz-details.html',
  styleUrl: './quiz-details.css'
})
export class QuizDetails implements OnInit {
  loading = signal(false);
  errorMessage = signal('');
  quiz = signal<any | null>(null);

  attemptStatus = signal<any | null>(null);
  statusChecked = signal(false);
  statusLoading = signal(false);
  statusError = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: StudentTheoryQuizService
  ) {}

  ngOnInit(): void {
    const quizId = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(quizId) || quizId <= 0) {
      this.errorMessage.set('Invalid quiz ID.');
      return;
    }

    this.loadQuiz(quizId);
  }

  loadQuiz(quizId: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.quizService.getQuizById(quizId).subscribe({
      next: response => {
        const quizData = response?.quiz ?? response;

        this.quiz.set(quizData);
        this.loading.set(false);

        this.loadAttemptStatus(quizId);
      },
      error: error => {
        this.errorMessage.set(
          error.error?.message ||
          'Unable to load quiz details. Please try again.'
        );

        this.loading.set(false);
      }
    });
  }

  loadAttemptStatus(quizId: number): void {
    this.statusLoading.set(true);
    this.statusChecked.set(false);
    this.statusError.set('');
    this.attemptStatus.set(null);

    this.quizService.getAttemptStatus(quizId).subscribe({
      next: response => {
        this.attemptStatus.set(response?.attempt ?? null);
        this.statusChecked.set(true);
        this.statusLoading.set(false);
      },
      error: error => {
        this.statusError.set(
          error.error?.message ||
          'Unable to check your quiz attempt. Please try again.'
        );

        this.statusLoading.set(false);
      }
    });
  }

  get attemptButtonLabel(): string {
    return this.attemptStatus()?.status === 'in_progress'
      ? 'Resume Quiz →'
      : 'Start Quiz →';
  }

  get isAttemptCompleted(): boolean {
    return this.attemptStatus()?.status === 'completed';
  }

  startQuiz(): void {
    const currentQuiz = this.quiz();

    if (!currentQuiz?.id || this.isAttemptCompleted) {
      return;
    }

    this.router.navigate([
      '/theory-quizzes',
      currentQuiz.id,
      'attempt'
    ]);
  }

  retryLoad(): void {
    const quizId = Number(this.route.snapshot.paramMap.get('id'));

    if (Number.isInteger(quizId) && quizId > 0) {
      this.loadQuiz(quizId);
    }
  }

  retryAttemptStatus(): void {
    const currentQuiz = this.quiz();

    if (currentQuiz?.id) {
      this.loadAttemptStatus(Number(currentQuiz.id));
    }
  }

viewResult(): void {
  const quizId = this.quiz()?.id;

  if (!quizId) {
    return;
  }

  this.router.navigate([
    '/theory-quizzes',
    quizId,
    'result'
  ]);
}
}