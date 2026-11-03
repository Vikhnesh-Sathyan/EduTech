
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  LogicToCodeService,
  StudentLogicToCodeProblem,
  StudentLogicToCodeSubject
} from '../../../../../../services/student/advanced/logic-to-code/logic-to-code.service';

@Component({
  selector: 'app-student-logic-to-code-problem-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './problem-list.html',
  styleUrl: './problem-list.css'
})
export class ProblemList implements OnInit {

  private logicToCodeService = inject(LogicToCodeService);
  private router = inject(Router);

  // =====================================================
  // COMPONENT STATE
  // =====================================================

  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  problems = signal<StudentLogicToCodeProblem[]>([]);
  subjects = signal<StudentLogicToCodeSubject[]>([]);

  search = signal<string>('');
  selectedDifficulty = signal<string>('');
  selectedSubject = signal<string>('');

  currentPage = signal<number>(1);
  pageLimit = 10;

  totalProblems = signal<number>(0);
  totalPages = signal<number>(0);

  // =====================================================
  // COMPONENT INITIALIZATION
  // =====================================================

  ngOnInit(): void {
    this.loadSubjects();
    this.loadProblems();
  }

  // =====================================================
  // LOAD AVAILABLE SUBJECTS
  // =====================================================

  loadSubjects(): void {

    this.logicToCodeService.getAvailableSubjects().subscribe({

      next: (response) => {

        if (response.success) {
          this.subjects.set(response.data || []);
        } else {
          console.error(
            'Unable to load subjects:',
            response.message
          );
        }

      },

      error: (error) => {

        console.error(
          'Failed to load subjects:',
          error
        );

      }

    });

  }

  // =====================================================
  // LOAD PUBLISHED PROBLEMS
  // =====================================================

  loadProblems(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.logicToCodeService.getProblems(
      this.search(),
      this.selectedDifficulty(),
      this.currentPage(),
      this.pageLimit,
      this.selectedSubject()
    ).subscribe({

      next: (response) => {

        if (response.success) {

          this.problems.set(response.data || []);

          this.totalProblems.set(
            response.pagination?.totalProblems || 0
          );

          this.totalPages.set(
            response.pagination?.totalPages || 0
          );

        } else {

          this.problems.set([]);
          this.totalProblems.set(0);
          this.totalPages.set(0);

          this.errorMessage.set(
            response.message || 'Unable to load problems.'
          );

        }

        this.loading.set(false);

      },

      error: (error) => {

        this.problems.set([]);
        this.totalProblems.set(0);
        this.totalPages.set(0);

        this.errorMessage.set(
          error.error?.message || 'Failed to load problems.'
        );

        this.loading.set(false);

      }

    });

  }

  // =====================================================
  // SEARCH PROBLEMS
  // =====================================================

  onSearchChange(value: string): void {

    this.search.set(value);
    this.currentPage.set(1);

    this.loadProblems();

  }

  // =====================================================
  // FILTER BY SUBJECT
  // =====================================================

  onSubjectChange(value: string): void {

    this.selectedSubject.set(value);
    this.currentPage.set(1);

    this.loadProblems();

  }

  // =====================================================
  // FILTER BY DIFFICULTY
  // =====================================================

  onDifficultyChange(value: string): void {

    this.selectedDifficulty.set(value);
    this.currentPage.set(1);

    this.loadProblems();

  }

  // =====================================================
  // PAGINATION
  // =====================================================

  goToPage(page: number): void {

    if (
      page < 1 ||
      page > this.totalPages() ||
      page === this.currentPage()
    ) {
      return;
    }

    this.currentPage.set(page);

    this.loadProblems();

  }

  // =====================================================
  // DIFFICULTY CLASS
  // =====================================================

  getDifficultyClass(difficulty: string): string {

    switch (difficulty?.toLowerCase()) {

      case 'easy':
        return 'easy';

      case 'medium':
        return 'medium';

      case 'hard':
        return 'hard';

      default:
        return '';

    }

  }

  // =====================================================
  // FORMAT DATE
  // =====================================================

  formatDate(date: string): string {

    if (!date) {
      return '—';
    }

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

  }

  // =====================================================
  // OPEN PROBLEM DETAILS
  // =====================================================

  openProblem(problemId: number): void {

    this.router.navigate([
      '/student/advanced/logic-to-code/problems',
      problemId
    ]);

  }

}
