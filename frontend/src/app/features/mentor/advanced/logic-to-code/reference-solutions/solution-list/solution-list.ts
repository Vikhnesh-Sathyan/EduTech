
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  LogicToCodeService,
  LogicToCodeSolution
} from '../../../../../../services/mentor/advanced/logic-to-code/logic-to-code.service';

import { ToastService } from '../../../../../../services/toast.service';

import { ConfirmModalComponent } from '../../../../../../shared/confirm-modal/confirm-modal';

@Component({
  selector: 'app-solution-list',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent],
  templateUrl: './solution-list.html',
  styleUrl: './solution-list.css'
})
export class SolutionList implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private logicToCodeService = inject(LogicToCodeService);
  private toastService = inject(ToastService);

  problemId = 0;

  solutions = signal<LogicToCodeSolution[]>([]);
  isLoading = signal(false);

  showDeleteModal = signal(false);
  selectedSolutionId = signal<number | null>(null);
  isDeleting = signal(false);

  ngOnInit(): void {
    this.problemId = Number(
      this.route.snapshot.paramMap.get('problemId')
    );

    if (
      !Number.isInteger(this.problemId) ||
      this.problemId <= 0
    ) {
      this.toastService.error('Invalid problem ID.');
      return;
    }

    this.loadSolutions();
  }

  // LOAD REFERENCE SOLUTIONS
  loadSolutions(): void {
    this.isLoading.set(true);

    this.logicToCodeService
      .getSolutions(this.problemId)
      .subscribe({
        next: (response) => {
          this.solutions.set(response.solutions || []);
          this.isLoading.set(false);
        },

        error: (error) => {
          this.isLoading.set(false);

          this.toastService.error(
            error.error?.message ||
            'Unable to load reference solutions.'
          );
        }
      });
  }

  // NAVIGATE TO CREATE
  addSolution(): void {
    this.router.navigate([
      '/mentor/advanced/logic-to-code',
      this.problemId,
      'solutions',
      'create'
    ]);
  }

  // NAVIGATE TO EDIT
  editSolution(solutionId: number): void {
    this.router.navigate([
      '/mentor/advanced/logic-to-code',
      this.problemId,
      'solutions',
      solutionId,
      'edit'
    ]);
  }

  // OPEN DELETE CONFIRMATION
  deleteSolution(solutionId: number): void {
    this.selectedSolutionId.set(solutionId);
    this.showDeleteModal.set(true);
  }

  // CANCEL DELETE
  cancelDelete(): void {
    if (this.isDeleting()) {
      return;
    }

    this.showDeleteModal.set(false);
    this.selectedSolutionId.set(null);
  }

  // CONFIRM DELETE
  confirmDeleteSolution(): void {
    const solutionId = this.selectedSolutionId();

    if (!solutionId || this.isDeleting()) {
      return;
    }

    this.isDeleting.set(true);

    this.logicToCodeService
      .deleteSolution(this.problemId, solutionId)
      .subscribe({
        next: (response) => {
          this.isDeleting.set(false);

          if (!response.success) {
            this.toastService.error(
              response.message || 'Unable to delete solution.'
            );
            return;
          }

          this.showDeleteModal.set(false);
          this.selectedSolutionId.set(null);

          this.toastService.success(
            response.message || 'Reference solution deleted successfully.'
          );

          this.loadSolutions();
        },

        error: (error) => {
          this.isDeleting.set(false);

          this.toastService.error(
            error.error?.message || 'Failed to delete reference solution.'
          );
        }
      });
  }

  // BACK TO PROBLEM LIST
  goBack(): void {
    this.router.navigate([
      '/mentor/advanced/logic-to-code'
    ]);
  }
}
