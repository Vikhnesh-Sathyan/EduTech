
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

  // STATUS UPDATE STATE
statusUpdating = signal<number | null>(null);

actionMessage = signal<string>('');
actionMessageType = signal<'success' | 'error'>('success');

  // ==========================================
// SEARCH AND FILTER STATE
// ==========================================

searchTerm = signal<string>('');

selectedDifficulty = signal<string>('all');

selectedStatus = signal<string>('all');

// ==========================================
// FILTERED PROBLEMS
// ==========================================

filteredProblems = computed(() => {

  const search = this.searchTerm().toLowerCase().trim();

  const difficulty = this.selectedDifficulty();

  const status = this.selectedStatus();

  return this.problems().filter(problem => {

    const matchesSearch =
      problem.title.toLowerCase().includes(search);

    const matchesDifficulty =
      difficulty === 'all' ||
      problem.difficulty === difficulty;

    const matchesStatus =
      status === 'all' ||
      problem.status === status;

    return (
      matchesSearch &&
      matchesDifficulty &&
      matchesStatus
    );

  });

});

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
// UPDATE PROBLEM STATUS
// ==========================================

changeProblemStatus(
  problemId: number,
  status: 'draft' | 'published' | 'archived'
): void {

  this.statusUpdating.set(problemId);
  this.actionMessage.set('');

  this.logicToCodeService
    .updateProblemStatus(problemId, status)
    .subscribe({

      next: (response) => {

        this.actionMessage.set(response.message);
        this.actionMessageType.set('success');

        this.statusUpdating.set(null);

        this.loadProblems();

      },

      error: (error) => {

        console.error('Update Problem Status Error:', error);

        this.actionMessage.set(
          error.error?.message || 'Unable to update problem status.'
        );

        this.actionMessageType.set('error');

        this.statusUpdating.set(null);

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

  manageTestCases(problemId: number): void {
  this.router.navigate([
    '/mentor/advanced/logic-to-code',
    problemId,
    'test-cases'
  ]);
}

// MANAGE REFERENCE SOLUTIONS
manageSolutions(problemId: number): void {
  this.router.navigate([
    '/mentor/advanced/logic-to-code',
    problemId,
    'solutions'
  ]);
}

// NAVIGATE TO HINT MANAGEMENT
manageHints(problemId: number): void {
  this.router.navigate([
    '/mentor/advanced/logic-to-code',
    problemId,
    'hints'
  ]);
}
manageMistakes(problemId: number): void {
  this.router.navigate([
    '/mentor/advanced/logic-to-code',
    problemId,
    'mistakes'
  ]);
}

// NAVIGATE TO LOGIC STEPS MANAGEMENT
manageSteps(problemId: number): void {
  console.log('Selected Problem ID:', problemId);
  console.log('Problem ID type:', typeof problemId);

  this.router.navigate([
    '/mentor/advanced/logic-to-code/problems',
    problemId,
    'steps'
  ]);
}

// ==========================================
// MANAGE PROBLEM DISCUSSIONS
// ==========================================

manageDiscussions(problemId: number): void {
  this.router.navigate([
    '/mentor/advanced/logic-to-code/problems',
    problemId,
    'discussions'
  ]);
}

}
