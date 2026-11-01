
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  LogicToCodeService,
  CreateLogicToCodeTestCase
} from '../../../../../../services/mentor/advanced/logic-to-code/logic-to-code.service';

import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-test-case-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-case-create.html',
  styleUrl: './test-case-create.css'
})
export class TestCaseCreate {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private logicToCodeService = inject(LogicToCodeService);
  private toastService = inject(ToastService);

  problemId = Number(
    this.route.snapshot.paramMap.get('problemId')
  );

  testInput = '';
  expectedOutput = '';
  visibility: 'public' | 'hidden' = 'public';

  isSaving = signal(false);


  // SAVE TEST CASE
  saveTestCase(): void {

    // Validate problem ID
    if (!Number.isInteger(this.problemId) || this.problemId <= 0) {
      this.toastService.error('Invalid problem ID.');
      return;
    }

    // Validate input and output
    if (!this.testInput.trim() || !this.expectedOutput.trim()) {
      this.toastService.error(
        'Input and expected output are required.'
      );
      return;
    }

    const data: CreateLogicToCodeTestCase = {
      test_input: this.testInput,
      expected_output: this.expectedOutput,
      visibility: this.visibility
    };

    this.isSaving.set(true);

    this.logicToCodeService
      .addTestCase(this.problemId, data)
      .subscribe({

        next: (response) => {

          this.isSaving.set(false);

          if (!response.success) {
            this.toastService.error(
              response.message || 'Unable to create test case.'
            );
            return;
          }

          this.toastService.success(
            response.message || 'Test case created successfully.'
          );

          this.router.navigate([
            '/mentor/advanced/logic-to-code',
            this.problemId,
            'test-cases'
          ]);
        },

        error: (error) => {

          this.isSaving.set(false);

          this.toastService.error(
            error.error?.message || 'Failed to create test case.'
          );
        }
      });
  }

  // CANCEL
  cancel(): void {

    if (this.isSaving()) {
      return;
    }

    this.router.navigate([
      '/mentor/advanced/logic-to-code',
      this.problemId,
      'test-cases'
    ]);
  }
}
