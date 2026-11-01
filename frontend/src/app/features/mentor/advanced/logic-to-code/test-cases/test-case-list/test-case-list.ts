import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  LogicToCodeService,
  LogicToCodeTestCase
} from '../../../../../../services/mentor/advanced/logic-to-code/logic-to-code.service';

import { ConfirmModalComponent } from '../../../../../../shared/confirm-modal/confirm-modal';
import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-test-case-list',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent],
  templateUrl: './test-case-list.html',
  styleUrl: './test-case-list.css'
})
export class TestCaseList implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private logicToCodeService = inject(LogicToCodeService);
  private toastService = inject(ToastService);

  problemId = 0;

  testCases = signal<LogicToCodeTestCase[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  showDeleteModal = signal(false);
  selectedTestCaseId = signal<number | null>(null);
  isDeleting = signal(false);

  ngOnInit(): void {
    this.problemId = Number(
      this.route.snapshot.paramMap.get('problemId')
    );

    if (!Number.isInteger(this.problemId) || this.problemId <= 0) {
      this.errorMessage.set('Invalid problem ID.');
      this.toastService.error('Invalid problem ID.');
      return;
    }

    this.loadTestCases();
  }

  // LOAD TEST CASES
  loadTestCases(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.logicToCodeService.getTestCases(this.problemId).subscribe({
      next: (response) => {
        this.testCases.set(response.testCases || []);
        this.isLoading.set(false);
      },
      error: (error) => {
        const message =
          error.error?.message || 'Unable to load test cases.';

        this.errorMessage.set(message);
        this.toastService.error(message);
        this.isLoading.set(false);
      }
    });
  }

  // ADD TEST CASE
  addTestCase(): void {
    this.router.navigate([
      '/mentor/advanced/logic-to-code',
      this.problemId,
      'test-cases',
      'create'
    ]);
  }

  // EDIT TEST CASE
  editTestCase(testCaseId: number): void {
    this.router.navigate([
      '/mentor/advanced/logic-to-code',
      this.problemId,
      'test-cases',
      testCaseId,
      'edit'
    ]);
  }

  // OPEN DELETE MODAL
  deleteTestCase(testCaseId: number): void {
    this.selectedTestCaseId.set(testCaseId);
    this.showDeleteModal.set(true);
  }

  // CANCEL DELETE
  cancelDelete(): void {
    if (this.isDeleting()) {
      return;
    }

    this.showDeleteModal.set(false);
    this.selectedTestCaseId.set(null);
  }

  // CONFIRM DELETE
  confirmDeleteTestCase(): void {
    const testCaseId = this.selectedTestCaseId();

    if (!testCaseId || this.isDeleting()) {
      return;
    }

    this.isDeleting.set(true);

    this.logicToCodeService
      .deleteTestCase(this.problemId, testCaseId)
      .subscribe({
        next: (response) => {
          this.isDeleting.set(false);

          if (!response.success) {
            this.toastService.error(
              response.message || 'Unable to delete test case.'
            );
            return;
          }

          this.showDeleteModal.set(false);
          this.selectedTestCaseId.set(null);

          this.toastService.success(
            response.message || 'Test case deleted successfully.'
          );

          this.loadTestCases();
        },
        error: (error) => {
          this.isDeleting.set(false);

          this.toastService.error(
            error.error?.message || 'Failed to delete test case.'
          );
        }
      });
  }

  // BACK TO PROBLEMS
  goBack(): void {
    this.router.navigate([
      '/mentor/advanced/logic-to-code'
    ]);
  }
}