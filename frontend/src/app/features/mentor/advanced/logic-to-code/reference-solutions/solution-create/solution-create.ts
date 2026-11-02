
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  LogicToCodeService,
  CreateLogicToCodeSolution
} from '../../../../../../services/mentor/advanced/logic-to-code/logic-to-code.service';

import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-solution-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solution-create.html',
  styleUrl: './solution-create.css'
})
export class SolutionCreate implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private logicToCodeService = inject(LogicToCodeService);
  private toastService = inject(ToastService);

  problemId = 0;

  language: 'python' | 'javascript' | 'java' = 'python';
  solutionCode = '';
  solutionExplanation = '';

  isSaving = signal(false);

  ngOnInit(): void {
    this.problemId = Number(
      this.route.snapshot.paramMap.get('problemId')
    );

    if (
      !Number.isInteger(this.problemId) ||
      this.problemId <= 0
    ) {
      this.toastService.error('Invalid problem ID.');
      this.goBack();
    }
  }

  // CREATE REFERENCE SOLUTION
  createSolution(): void {

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
      .addSolution(this.problemId, data)
      .subscribe({
        next: (response) => {
          this.isSaving.set(false);

          if (!response.success) {
            this.toastService.error(
              response.message || 'Unable to add solution.'
            );
            return;
          }

          this.toastService.success(
            response.message || 'Reference solution added successfully.'
          );

          this.goBack();
        },

        error: (error) => {
          this.isSaving.set(false);

          this.toastService.error(
            error.error?.message || 'Failed to add reference solution.'
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
