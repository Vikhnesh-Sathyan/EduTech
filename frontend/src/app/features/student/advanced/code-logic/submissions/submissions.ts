
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  StudentCodeToLogicService,
  CodeToLogicSubmission
} from '../../../../../services/student/advanced/code-logic/student-code-to-logic.service';

import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-student-code-to-logic-submissions',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './submissions.html',
  styleUrl: './submissions.css'
})
export class StudentCodeToLogicSubmissionsComponent implements OnInit {
  private readonly service = inject(StudentCodeToLogicService);
  private readonly toastService = inject(ToastService);

  submissions = signal<CodeToLogicSubmission[]>([]);
  loading = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {
    this.loadSubmissions();
  }

  loadSubmissions(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.service.getMySubmissions().subscribe({
      next: response => {
        this.submissions.set(response.submissions ?? []);
        this.loading.set(false);
      },
      error: error => {
        console.error('Failed to load submissions:', error);

        const message =
          error.error?.message ||
          'Unable to load your submission history. Please try again.';

        this.errorMessage.set(message);
        this.toastService.error(message);
        this.loading.set(false);
      }
    });
  }

  get reviewedCount(): number {
    return this.submissions().filter(
      submission => submission.review_status === 'reviewed'
    ).length;
  }

  get pendingCount(): number {
    return this.submissions().filter(
      submission => submission.review_status === 'pending'
    ).length;
  }

  getStars(rating: number | null): number[] {
    return Array.from({ length: 5 }, (_, index) =>
      index < (rating ?? 0) ? 1 : 0
    );
  }

  formatDate(date: string | null): string {
    if (!date) {
      return 'Not available';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Not available';
    }

    return parsedDate.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
