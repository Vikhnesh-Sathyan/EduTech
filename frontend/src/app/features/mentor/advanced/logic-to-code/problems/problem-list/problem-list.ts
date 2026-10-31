
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import {
  LogicToCodeService,
  LogicToCodeProblem
} from '../../../../../../services/mentor/advanced/logic-to-code/logic-to-code.service';

@Component({
  selector: 'app-problem-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './problem-list.html',
  styleUrl: './problem-list.css'
})
export class ProblemList implements OnInit {

  private logicToCodeService = inject(LogicToCodeService);
  private router = inject(Router);

  // ==========================================
  // STATE
  // ==========================================

  problems = signal<LogicToCodeProblem[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  // ==========================================
  // PROBLEM SUMMARY COUNTS
  // ==========================================

  publishedCount = computed(() =>
    this.problems().filter(p => p.status === 'published').length
  );

  draftCount = computed(() =>
    this.problems().filter(p => p.status === 'draft').length
  );

  archivedCount = computed(() =>
    this.problems().filter(p => p.status === 'archived').length
  );

  // ==========================================
  // INITIALIZATION
  // ==========================================

  ngOnInit(): void {
    this.loadProblems();
  }

  // ==========================================
  // LOAD MENTOR PROBLEMS
  // ==========================================

  loadProblems(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.logicToCodeService.getMyProblems().subscribe({
      next: (response) => {
        this.problems.set(response.problems || []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Load Problems Error:', error);

        this.errorMessage.set(
          error.error?.message || 'Unable to load problems.'
        );

        this.loading.set(false);
      }
    });
  }

  // ==========================================
  // NAVIGATION
  // ==========================================

  createProblem(): void {
    this.router.navigate([
      '/mentor/advanced/logic-to-code/problems/create'
    ]);
  }

  viewProblem(problemId: number): void {
    this.router.navigate([
      '/mentor/advanced/logic-to-code/problems',
      problemId
    ]);
  }

  goToDashboard(): void {
    this.router.navigate([
      '/mentor/advanced/logic-to-code/dashboard'
    ]);
  }

  // ==========================================
  // STATUS LABEL
  // ==========================================

  getStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  // ==========================================
  // DIFFICULTY LABEL
  // ==========================================

  getDifficultyLabel(difficulty: string): string {
    return difficulty.charAt(0).toUpperCase() +
      difficulty.slice(1);
  }
}
