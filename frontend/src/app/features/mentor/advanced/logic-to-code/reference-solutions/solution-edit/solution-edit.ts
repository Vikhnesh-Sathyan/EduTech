
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  LogicToCodeService,
  LogicToCodeSolution,
  CreateLogicToCodeSolution
} from '../../../../../../services/mentor/advanced/logic-to-code/logic-to-code.service';

import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-solution-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solution-edit.html',
  styleUrl: './solution-edit.css'
})
export class SolutionEdit implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private logicToCodeService = inject(LogicToCodeService);
  private toastService = inject(ToastService);

  problemId = 0;
  solutionId = 0;

  language: 'python' | 'javascript' | 'java' = 'python';
  solutionCode = '';
  solutionExplanation = '';

  isLoading = signal(false);
  isSaving = signal(false);
  hasLoadError = signal(false);

  ngOnInit(): void {
    this.problemId = Number(
      this.route.snapshot.paramMap.get('problemId')
    );

    this.solutionId = Number(
      this.route.snapshot.paramMap.get('solutionId')
    );

    if (
      !Number.isInteger(this.problemId) ||
      this.problemId <= 0 ||
      !Number.isInteger(this.solutionId) ||
      this.solutionId <= 0
    ) {
      this.toastService.error('Invalid solution details.');
      this.goBack();
      return;
    }

    this.loadSolution();
  }

  // LOAD EXISTING SOLUTION
  loadSolution(): void {
    this.isLoading.set(true);
    this.hasLoadError.set(false);

    this.logicToCodeService
      .getSolutions(this.problemId)
      .subscribe({
        next: (response) => {
          const solution: LogicToCodeSolution | undefined =
            response.solutions?.find(
              item => item.id === this.solutionId
            );

          this.isLoading.set(false);

          if (!solution) {
            this.hasLoadError.set(true);
            this.toastService.error('Reference solution not found.');
            return;
          }

          this.language = solution.language;
          this.solutionCode = solution.solution_code;
          this.solutionExplanation =
            solution.solution_explanation || '';
        },

        error: (error) => {
          this.isLoading.set(false);
          this.hasLoadError.set(true);

          this.toastService.error(
            error.error?.message ||
            'Unable to load reference solution.'
          );
        }
      });
  }

  // UPDATE REFERENCE SOLUTION
  updateSolution(): void {

    if (!this.solutionCode.trim()) {
      this.toastService.error('Solution code is required.');
      return;
    }

    const data: CreateLogicToCodeSolution = {
      language: this.language,
      solution_code: this.solutionCode,
      solution_explanation: this.solutionExplanation.trim()
    };

    this.isSaving.set(true);

    this.logicToCodeService
      .updateSolution(this.problemId, this.solutionId, data)
      .subscribe({
        next: (response) => {
          this.isSaving.set(false);

          if (!response.success) {
            this.toastService.error(
              response.message || 'Unable to update solution.'
            );
            return;
          }

          this.toastService.success(
            response.message ||
            'Reference solution updated successfully.'
          );

          this.goBack();
        },

        error: (error) => {
          this.isSaving.set(false);

          this.toastService.error(
            error.error?.message ||
            'Failed to update reference solution.'
          );
        }
      });
  }

  // BACK TO SOLUTION LIST
  goBack(): void {
    this.router.navigate([
      '/mentor/advanced/logic-to-code',
      this.problemId,
      'solutions'
    ]);
  }

  // CANCEL
  cancel(): void {
    if (this.isSaving()) {
      return;
    }

    this.goBack();
  }
}
