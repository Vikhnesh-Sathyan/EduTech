
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  StudentTheoryQuiz,
  StudentTheoryQuizService
} from '../../../../../services/student/advanced/student-theory-quiz.service';

type QuizProgressStatus =
  | 'passed'
  | 'retry'
  | 'in_progress'
  | 'not_attempted'
  | 'unknown';

@Component({
  selector: 'app-student-theory-quiz-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quiz-list.html',
  styleUrl: './quiz-list.css'
})
export class QuizList implements OnInit {
  loading = signal(false);
  errorMessage = signal('');
  searchTerm = signal('');
  selectedDifficulty = signal('all');

  quizzes = signal<StudentTheoryQuiz[]>([]);
  quizStatuses = signal<Record<number, QuizProgressStatus>>({});

  filteredQuizzes = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const difficulty = this.selectedDifficulty();

    return this.quizzes().filter(quiz => {
      const matchesSearch =
        quiz.title.toLowerCase().includes(search) ||
        (quiz.description ?? '').toLowerCase().includes(search) ||
        (quiz.program_name ?? '').toLowerCase().includes(search) ||
        (quiz.department_name ?? '').toLowerCase().includes(search) ||
        (quiz.education_year_name ?? '').toLowerCase().includes(search) ||
        (quiz.subject_name ?? '').toLowerCase().includes(search);

      const matchesDifficulty =
        difficulty === 'all' ||
        (quiz.difficulty ?? '').toLowerCase() === difficulty;

      return matchesSearch && matchesDifficulty;
    });
  });

  constructor(
    private quizService: StudentTheoryQuizService
  ) {}

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.quizStatuses.set({});

    this.quizService.getPublishedQuizzes().subscribe({
      next: response => {
        const quizzes = response.quizzes ?? [];

        this.quizzes.set(quizzes);

        if (!quizzes.length) {
          this.loading.set(false);
          return;
        }

        const statusRequests = quizzes.map(quiz =>
          this.quizService.getAttemptStatus(quiz.id).pipe(
            catchError(error => {
              console.error(
                `Could not load status for quiz ${quiz.id}:`,
                error
              );

              return of(null);
            })
          )
        );

        forkJoin(statusRequests).subscribe({
          next: responses => {
            const statuses: Record<number, QuizProgressStatus> = {};

            quizzes.forEach((quiz, index) => {
              const response = responses[index];
              const attempt = response?.attempt;

              if (!response) {
                statuses[quiz.id] = 'unknown';
                return;
              }

              const passMark = Number(quiz.pass_percentage ?? 60);

              if (response.passed === true || attempt?.passed === true) {
                statuses[quiz.id] = 'passed';
                return;
              }

              if (attempt?.status === 'in_progress') {
                statuses[quiz.id] = 'in_progress';
                return;
              }

              if (attempt?.status === 'completed') {
                const percentage = Number(attempt.percentage ?? 0);

                statuses[quiz.id] =
                  percentage >= passMark ? 'passed' : 'retry';

                return;
              }

              statuses[quiz.id] = 'not_attempted';
            });

            this.quizStatuses.set(statuses);
            this.loading.set(false);
          },
          error: error => {
            console.error('Failed to load quiz statuses:', error);
            this.loading.set(false);
          }
        });
      },
      error: error => {
        console.error('Failed to load student quizzes:', error);

        this.errorMessage.set(
          error.error?.message ||
          'Unable to load theory quizzes. Please try again.'
        );

        this.loading.set(false);
      }
    });
  }

  getQuizStatus(quizId: number): QuizProgressStatus {
    return this.quizStatuses()[quizId] ?? 'unknown';
  }

  getStatusLabel(quizId: number): string {
    switch (this.getQuizStatus(quizId)) {
      case 'passed':
        return 'Passed';
      case 'retry':
        return 'Retry Available';
      case 'in_progress':
        return 'In Progress';
      case 'not_attempted':
        return 'Not Attempted';
      default:
        return 'Status Unavailable';
    }
  }

  getActionLabel(quizId: number): string {
    switch (this.getQuizStatus(quizId)) {
      case 'passed':
        return 'View Result';
      case 'retry':
        return 'Retry Quiz';
      case 'in_progress':
        return 'Continue Quiz';
      case 'not_attempted':
        return 'Start Quiz';
      default:
        return 'View Quiz';
    }
  }

  trackByQuizId(
    _index: number,
    quiz: StudentTheoryQuiz
  ): number {
    return quiz.id;
  }
}
