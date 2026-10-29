
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  StudentCodeToLogicService,
  CodeToLogicTask
} from '../../../../../services/student/advanced/code-logic/student-code-to-logic.service';

import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-student-code-to-logic-task-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './task-details.html',
  styleUrl: './task-details.css'
})
export class StudentCodeToLogicTaskDetailsComponent implements OnInit {
  private readonly service = inject(StudentCodeToLogicService);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);

  task = signal<CodeToLogicTask | null>(null);
  loading = signal(true);
  errorMessage = signal('');
  explanation = '';
  submitting = signal(false);

  ngOnInit(): void {
    const taskId = Number(this.route.snapshot.paramMap.get('taskId'));

    if (!Number.isInteger(taskId) || taskId <= 0) {
      this.errorMessage.set('Invalid task ID.');
      this.loading.set(false);
      this.toastService.error('Invalid task ID.');
      return;
    }

    this.loadTask(taskId);
  }

  loadTask(taskId: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.service.getTaskDetails(taskId).subscribe({
      next: response => {
        this.task.set(response.task);
        this.loading.set(false);
      },
      error: error => {
        console.error('Failed to load task details:', error);

        const message =
          error.error?.message ||
          'Unable to load this task. Please try again.';

        this.errorMessage.set(message);
        this.toastService.error(message);
        this.loading.set(false);
      }
    });
  }

  submitExplanation(): void {
    const task = this.task();
    const text = this.explanation.trim();

    if (!task || this.submitting()) {
      return;
    }

    if (!text) {
      this.errorMessage.set(
        'Please write your explanation before submitting.'
      );
      this.toastService.error(
        'Please write your explanation before submitting.'
      );
      return;
    }

    this.errorMessage.set('');
    this.submitting.set(true);

    this.service.submitExplanation(task.id, text).subscribe({
      next: response => {
        this.toastService.success(
          `Explanation submitted successfully! Attempt ${response.submissionNumber}.`
        );

        this.explanation = '';
        this.submitting.set(false);
      },
      error: error => {
        console.error('Explanation submission failed:', error);

        const message =
          error.error?.message ||
          'Failed to submit your explanation. Please try again.';

        this.errorMessage.set(message);
        this.toastService.error(message);
        this.submitting.set(false);
      }
    });
  }
}
