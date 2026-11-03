import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  LogicToCodeService,
  StudentLogicToCodeProblem
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

  search = signal<string>('');
  selectedDifficulty = signal<string>('');

  currentPage = signal<number>(1);
  pageLimit = 10;

  totalProblems = signal<number>(0);
  totalPages = signal<number>(0);

  // =====================================================
  // COMPONENT INITIALIZATION
  // =====================================================

  ngOnInit(): void {
    this.loadProblems();
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
      this.pageLimit
    ).subscribe({

      next: (response) => {

        console.log('STUDENT PROBLEMS API RESPONSE:', response);

        if (response.success) {

          
          this.problems.set(response.data || []);

          this.totalProblems.set(
            response.pagination?.totalProblems || 0
          );

          this.totalPages.set(
            response.pagination?.totalPages || 0
          );

        } else {

          this.errorMessage.set(
            response.message || 'Unable to load problems.'
          );

        }

        this.loading.set(false);

      },

      error: (error) => {

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
