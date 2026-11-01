import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  LogicToCodeService,
  CreateLogicToCodeTestCase
} from '../../../../../../services/mentor/advanced/logic-to-code/logic-to-code.service';

import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-test-case-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-case-edit.html',
  styleUrl: './test-case-edit.css'
})
export class TestCaseEdit implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private logicToCodeService = inject(LogicToCodeService);
  private toastService = inject(ToastService);

  problemId = 0;
  testCaseId = 0;

  testInput = '';
  expectedOutput = '';
  visibility: 'public' | 'hidden' = 'public';

  isLoading = signal(false);
  isSaving = signal(false);

  ngOnInit(): void {
    this.problemId = Number(
      this.route.snapshot.paramMap.get('problemId')
    );

    this.testCaseId = Number(
      this.route.snapshot.paramMap.get('testCaseId')
    );

    if (
      !Number.isInteger(this.problemId) ||
      this.problemId <= 0 ||
      !Number.isInteger(this.testCaseId) ||
      this.testCaseId <= 0
    ) {
      this.toastService.error('Invalid test case details.');
      return;
    }

    this.loadTestCase();
  }

  // LOAD EXISTING TEST CASE
  loadTestCase(): void {
    this.isLoading.set(true);

    this.logicToCodeService
      .getTestCases(this.problemId)
      .subscribe({
        next: (response) => {
          const testCase = response.testCases?.find(
            item => item.id === this.testCaseId
          );

          this.isLoading.set(false);

          if (!testCase) {
            this.toastService.error('Test case not found.');
            this.goBack();
            return;
          }

          this.testInput = testCase.test_input;
          this.expectedOutput = testCase.expected_output;
          this.visibility = testCase.visibility;
        },

        error: (error) => {
          this.isLoading.set(false);

          this.toastService.error(
            error.error?.message || 'Unable to load test case.'
          );
        }
      });
  }

  // UPDATE TEST CASE
  updateTestCase(): void {

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
      .updateTestCase(this.problemId, this.testCaseId, data)
      .subscribe({
        next: (response) => {
          this.isSaving.set(false);

          if (!response.success) {
            this.toastService.error(
              response.message || 'Unable to update test case.'
            );
            return;
          }

          this.toastService.success(
            response.message || 'Test case updated successfully.'
          );

          this.goBack();
        },

        error: (error) => {
          this.isSaving.set(false);

          this.toastService.error(
            error.error?.message || 'Failed to update test case.'
          );
        }
      });
  }

  // BACK TO TEST CASE LIST
  goBack(): void {
    this.router.navigate([
      '/mentor/advanced/logic-to-code',
      this.problemId,
      'test-cases'
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