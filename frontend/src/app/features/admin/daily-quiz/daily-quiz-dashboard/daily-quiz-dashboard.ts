
import { Component, OnInit, signal, computed } from '@angular/core';

import {
  AdminDailyQuiz,
  DailyQuizDashboardSubject
} from '../../../../services/admin/daily-quiz/admin-daily-quiz.service';

@Component({
  selector: 'app-daily-quiz-dashboard',
  imports: [],
  templateUrl: './daily-quiz-dashboard.html',
  styleUrl: './daily-quiz-dashboard.css',
})
export class DailyQuizDashboard implements OnInit {

  // ==========================================
  // STATE
  // ==========================================

  subjects = signal<DailyQuizDashboardSubject[]>([]);

  loading = signal(false);
  errorMessage = signal('');

  // ==========================================
  // COMPUTED SUMMARY
  // ==========================================

  totalQuestions = computed(() =>
    this.subjects().reduce(
      (total, subject) => total + subject.total_questions,
      0
    )
  );

  unusedQuestions = computed(() =>
    this.subjects().reduce(
      (total, subject) => total + subject.unused_questions,
      0
    )
  );

  possibleQuizzes = computed(() =>
    this.subjects().reduce(
      (total, subject) => total + subject.possible_quizzes,
      0
    )
  );

  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private dailyQuizService: AdminDailyQuiz
  ) {}

  // ==========================================
  // INITIALIZE
  // ==========================================

  ngOnInit(): void {
    this.loadDashboard();
  }

  // ==========================================
  // LOAD DASHBOARD
  // ==========================================

  loadDashboard(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.dailyQuizService.getDashboard().subscribe({

      next: (response) => {

        this.subjects.set(response.data || []);

        this.loading.set(false);
      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message ||
          'Failed to load Daily Quiz dashboard'
        );

        this.loading.set(false);
      }

    });
  }

}
