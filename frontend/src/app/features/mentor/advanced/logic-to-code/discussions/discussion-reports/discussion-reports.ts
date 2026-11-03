
import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  MentorDiscussionService,
  MentorDiscussionReport
} from '../../../../../../services/mentor/advanced/logic-to-code/discussion.service';

import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-mentor-discussion-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './discussion-reports.html',
  styleUrl: './discussion-reports.css'
})
export class DiscussionReports implements OnInit {

  private discussionService = inject(MentorDiscussionService);
  private toast = inject(ToastService);

  // Report data
  reports = signal<MentorDiscussionReport[]>([]);

  // Loading and error states
  loading = signal(false);
  errorMessage = signal('');

  // Filter
  selectedStatus = signal('');

  // Pagination
  currentPage = signal(1);
  totalPages = signal(0);
  totalReports = signal(0);
  limit = 10;

  // Review action
  reviewingReportId = signal<number | null>(null);
  pendingReviewStatus = signal<'action_taken' | 'dismissed' | null>(null);

  deletingDiscussionId = signal<number | null>(null);
  confirmingDeleteReportId = signal<number | null>(null);

  ngOnInit(): void {
    this.loadReports();
  }

  // LOAD REPORTS
  loadReports(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.discussionService.getDiscussionReports(
      this.selectedStatus(),
      this.currentPage(),
      this.limit
    ).subscribe({

      next: response => {

        if (response.success) {

          this.reports.set(response.reports || []);

          this.currentPage.set(response.pagination.currentPage);
          this.totalPages.set(response.pagination.totalPages);
          this.totalReports.set(response.pagination.totalReports);

        } else {

          this.errorMessage.set(
            response.message || 'Unable to load reports.'
          );

        }

        this.loading.set(false);
      },

      error: error => {

        this.errorMessage.set(
          error.error?.message || 'Failed to load discussion reports.'
        );

        this.loading.set(false);
      }
    });
  }

  // CHANGE STATUS FILTER
  changeStatus(status: string): void {

    this.selectedStatus.set(status);
    this.currentPage.set(1);

    this.loadReports();
  }

  // OPEN REVIEW CONFIRMATION
  openReview(
    reportId: number,
    status: 'action_taken' | 'dismissed'
  ): void {

    this.reviewingReportId.set(reportId);
    this.pendingReviewStatus.set(status);
  }

  // CANCEL REVIEW
  cancelReview(): void {

    this.reviewingReportId.set(null);
    this.pendingReviewStatus.set(null);
  }

  // CONFIRM REPORT REVIEW
  confirmReview(): void {

    const reportId = this.reviewingReportId();
    const status = this.pendingReviewStatus();

    if (!reportId || !status) {
      return;
    }

    this.discussionService.reviewDiscussionReport(
      reportId,
      status
    ).subscribe({

      next: response => {

        this.toast.success(
          response.message || 'Report reviewed successfully.'
        );

        this.cancelReview();
        this.loadReports();
      },

      error: error => {

        this.toast.error(
          error.error?.message || 'Failed to review report.'
        );
      }
    });
  }

  // PREVIOUS PAGE
  previousPage(): void {

    if (this.currentPage() > 1) {

      this.currentPage.update(page => page - 1);
      this.loadReports();
    }
  }

  // NEXT PAGE
  nextPage(): void {

    if (this.currentPage() < this.totalPages()) {

      this.currentPage.update(page => page + 1);
      this.loadReports();
    }
  }

  // =====================================================
// OPEN DELETE CONFIRMATION
// =====================================================

openDeleteConfirmation(reportId: number): void {
  this.confirmingDeleteReportId.set(reportId);
}

// =====================================================
// CANCEL DELETE
// =====================================================

cancelDelete(): void {
  this.confirmingDeleteReportId.set(null);
}

// =====================================================
// DELETE REPORTED DISCUSSION
// =====================================================

confirmDelete(report: MentorDiscussionReport): void {

  if (report.is_deleted || this.deletingDiscussionId()) {
    return;
  }

  this.deletingDiscussionId.set(report.report_id);

  this.discussionService.deleteReportedDiscussion(
    report.problem_id,
    report.discussion_id
  ).subscribe({

    next: response => {

      this.toast.success(
        response.message || 'Discussion deleted successfully.'
      );

      this.confirmingDeleteReportId.set(null);
      this.deletingDiscussionId.set(null);

      this.loadReports();

    },

    error: error => {

      this.toast.error(
        error.error?.message || 'Failed to delete discussion.'
      );

      this.deletingDiscussionId.set(null);

    }

  });

}

}
