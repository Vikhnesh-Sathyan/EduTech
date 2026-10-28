
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  CodeLogicProblem,
  CodeLogicService
} from '../../../../../services/mentor/advanced/code-logic/code-logic.service';

@Component({
  selector: 'app-code-logic-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './code-logic-list.html',
  styleUrl: './code-logic-list.css'
})
export class CodeLogicListComponent implements OnInit {

  problems: CodeLogicProblem[] = [];

  searchText = '';
  selectedStatus = 'all';
  selectedDifficulty = 'all';

  isLoading = true;
  errorMessage = '';
  successMessage = '';
  actionInProgress: number | null = null;

  constructor(
    private codeLogicService: CodeLogicService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProblems();
  }

  // LOAD MENTOR'S PROBLEMS
  loadProblems(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.codeLogicService.getMyProblems().subscribe({
      next: (response) => {
        this.problems = response.problems ?? [];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message ||
          'Unable to load problems. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // FILTER PROBLEMS
  get filteredProblems(): CodeLogicProblem[] {
    const search = this.searchText.trim().toLowerCase();

    return this.problems.filter((problem) => {
      const matchesSearch =
        problem.title.toLowerCase().includes(search) ||
        problem.description.toLowerCase().includes(search) ||
        problem.language_name.toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'all' ||
        problem.status === this.selectedStatus;

      const matchesDifficulty =
        this.selectedDifficulty === 'all' ||
        problem.difficulty === this.selectedDifficulty;

      return matchesSearch && matchesStatus && matchesDifficulty;
    });
  }

  // DASHBOARD COUNTS
  get totalProblems(): number {
    return this.problems.length;
  }

  get publishedCount(): number {
    return this.problems.filter(
      problem => problem.status === 'published'
    ).length;
  }

  get draftCount(): number {
    return this.problems.filter(
      problem => problem.status === 'draft'
    ).length;
  }

  get inactiveCount(): number {
    return this.problems.filter(
      problem => problem.status === 'inactive'
    ).length;
  }

  // NAVIGATION
  createProblem(): void {
    this.router.navigate([
      '/mentor/advanced/code-logic/create'
    ]);
  }

  viewProblem(problemId: number): void {
    this.router.navigate([
      '/mentor/advanced/code-logic/view',
      problemId
    ]);
  }

  editProblem(problem: CodeLogicProblem): void {
    if (problem.status !== 'draft') {
      return;
    }

    this.router.navigate([
      '/mentor/advanced/code-logic/edit',
      problem.id
    ]);
  }

  // PUBLISH
  publishProblem(problem: CodeLogicProblem): void {
    if (
      problem.status !== 'draft' ||
      this.actionInProgress !== null
    ) {
      return;
    }

    if (!confirm(`Publish "${problem.title}"?`)) {
      return;
    }

    this.runAction(
      problem.id,
      () => this.codeLogicService.publishProblem(problem.id),
      'Problem published successfully.'
    );
  }

  // UNPUBLISH
  unpublishProblem(problem: CodeLogicProblem): void {
    if (
      problem.status !== 'published' ||
      this.actionInProgress !== null
    ) {
      return;
    }

    if (!confirm(`Unpublish "${problem.title}"?`)) {
      return;
    }

    this.runAction(
      problem.id,
      () => this.codeLogicService.unpublishProblem(problem.id),
      'Problem unpublished successfully.'
    );
  }

  // DEACTIVATE
  deactivateProblem(problem: CodeLogicProblem): void {
    if (
      problem.status === 'inactive' ||
      this.actionInProgress !== null
    ) {
      return;
    }

    if (!confirm(`Deactivate "${problem.title}"?`)) {
      return;
    }

    this.runAction(
      problem.id,
      () => this.codeLogicService.deactivateProblem(problem.id),
      'Problem deactivated successfully.'
    );
  }

  // REACTIVATE
  reactivateProblem(problem: CodeLogicProblem): void {
    if (
      problem.status !== 'inactive' ||
      this.actionInProgress !== null
    ) {
      return;
    }

    if (!confirm(`Reactivate "${problem.title}"?`)) {
      return;
    }

    this.runAction(
      problem.id,
      () => this.codeLogicService.reactivateProblem(problem.id),
      'Problem reactivated successfully.'
    );
  }

  // DELETE DRAFT
  deleteProblem(problem: CodeLogicProblem): void {
    if (
      problem.status !== 'draft' ||
      this.actionInProgress !== null
    ) {
      return;
    }

    if (!confirm(`Permanently delete "${problem.title}"?`)) {
      return;
    }

    this.runAction(
      problem.id,
      () => this.codeLogicService.deleteProblem(problem.id),
      'Draft deleted successfully.'
    );
  }

  // REUSABLE ACTION HANDLER
  private runAction(
    problemId: number,
    action: () => import('rxjs').Observable<unknown>,
    successMessage: string
  ): void {
    this.actionInProgress = problemId;
    this.errorMessage = '';
    this.successMessage = '';

    action().subscribe({
      next: () => {
        this.actionInProgress = null;
        this.successMessage = successMessage;
        this.loadProblems();
      },
      error: (error) => {
        this.actionInProgress = null;
        this.errorMessage =
          error.error?.message ||
          'The action failed. Please try again.';
      }
    });
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
