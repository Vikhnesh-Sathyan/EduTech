
import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  input,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterLink } from '@angular/router';

import {
  StudentCodeToLogicService,
  CodeToLogicSubmissionStatus
} from '../../../../../services/student/advanced/code-logic/student-code-to-logic.service';

import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-student-code-to-logic-submission-status',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './submission-status.html',
  styleUrl: './submission-status.css'
})
export class StudentCodeToLogicSubmissionStatusComponent
  implements OnInit, OnChanges {

  private readonly service = inject(StudentCodeToLogicService);
  private readonly toastService = inject(ToastService);

  taskId = input.required<number>();

  status = signal<CodeToLogicSubmissionStatus | null>(null);
  attemptCount = signal(0);
  loading = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {
    this.loadStatus();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['taskId'] && !changes['taskId'].firstChange) {
      this.loadStatus();
    }
  }

  loadStatus(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.service.getTaskSubmissionStatus(this.taskId()).subscribe({
      next: response => {
        this.status.set(response);
        this.attemptCount.set(response.attemptCount ?? 0);
        this.loading.set(false);
      },
      error: error => {
        console.error('Failed to load submission status:', error);

        const message =
          error.error?.message ||
          'Unable to load submission status.';

        this.errorMessage.set(message);
        this.toastService.error(message);
        this.loading.set(false);
      }
    });
  }

  refreshStatus(): void {
    this.loadStatus();
  }
}
