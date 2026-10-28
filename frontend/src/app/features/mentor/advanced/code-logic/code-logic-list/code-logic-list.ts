import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import {
  CodeLogicProblem,
  CodeLogicService
} from '../../../../../services/mentor/advanced/code-logic/code-logic.service';

@Component({
  selector: 'app-code-logic-list',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './code-logic-list.html',
  styleUrl: './code-logic-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeLogicListComponent implements OnInit {

  private readonly codeLogicService = inject(CodeLogicService);
  private readonly router = inject(Router);

  // STATE
  readonly problems = signal<CodeLogicProblem[]>([]);

  readonly searchText = signal('');
  readonly selectedStatus = signal('all');
  readonly selectedDifficulty = signal('all');

  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly actionInProgress = signal<number | null>(null);

  // DERIVED STATE
  readonly filteredProblems = computed(() => {
    const search = this.searchText().trim().toLowerCase();
    const status = this.selectedStatus();
    const difficulty = this.selectedDifficulty();

    return this.problems().filter((problem) => {
      const matchesSearch =
        !search ||
        (problem.title ?? '').toLowerCase().includes(search) ||
        (problem.description ?? '').toLowerCase().includes(search) ||
        (problem.language_name ?? '').toLowerCase().includes(search);

      const matchesStatus = status === 'all' || problem.status === status;
      const matchesDifficulty =
        difficulty === 'all' || problem.difficulty === difficulty;

      return matchesSearch && matchesStatus && matchesDifficulty;
    });
  });

  // Dashboard counts, calculated in one pass
  readonly counts = computed(() => {
    const all = this.problems();
    return {
      total: all.length,
      published: all.filter((p) => p.status === 'published').length,
      draft: all.filter((p) => p.status === 'draft').length,
      inactive: all.filter((p) => p.status === 'inactive').length
    };
  });

  ngOnInit(): void {
    this.loadProblems();
  }

  // LOAD MENTOR'S PROBLEMS
  // showLoader = false refreshes the list quietly after an action
  loadProblems(showLoader = true): void {
    if (showLoader) {
      this.isLoading.set(true);
      this.errorMessage.set('');
    }

    this.codeLogicService.getMyProblems().subscribe({
      next: (response) => {
        this.problems.set(response.problems ?? []);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.message || 'Unable to load problems. Please try again.'
        );
        this.isLoading.set(false);
      }
    });
  }

  // FILTER HELPERS
  clearFilters(): void {
    this.searchText.set('');
    this.selectedStatus.set('all');
    this.selectedDifficulty.set('all');
  }

  // NAVIGATION
  createProblem(): void {
    this.router.navigate(['/mentor/advanced/code-logic/create']);
  }

  viewProblem(problemId: number): void {
    this.router.navigate(['/mentor/advanced/code-logic/view', problemId]);
  }

  editProblem(problem: CodeLogicProblem): void {
    if (problem.status !== 'draft') {
      return;
    }

    this.router.navigate(['/mentor/advanced/code-logic/edit', problem.id]);
  }

  // PUBLISH
  publishProblem(problem: CodeLogicProblem): void {
    if (problem.status !== 'draft' || this.actionInProgress() !== null) {
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
    if (problem.status !== 'published' || this.actionInProgress() !== null) {
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
    if (problem.status === 'inactive' || this.actionInProgress() !== null) {
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
    if (problem.status !== 'inactive' || this.actionInProgress() !== null) {
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
    if (problem.status !== 'draft' || this.actionInProgress() !== null) {
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
    action: () => Observable<unknown>,
    successMessage: string
  ): void {
    this.actionInProgress.set(problemId);
    this.errorMessage.set('');
    this.successMessage.set('');

    action().subscribe({
      next: () => {
        this.actionInProgress.set(null);
        this.successMessage.set(successMessage);
        this.loadProblems(false);
      },
      error: (error) => {
        this.actionInProgress.set(null);
        this.errorMessage.set(
          error.error?.message || 'The action failed. Please try again.'
        );
      }
    });
  }

  clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}