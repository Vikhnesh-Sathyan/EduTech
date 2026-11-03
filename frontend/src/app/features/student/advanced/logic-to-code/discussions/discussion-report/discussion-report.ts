
import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  DiscussionService
} from '../../../../../../services/student/advanced/logic-to-code/discussion.service';

import {
  ToastService
} from '../../../../../../services/toast.service';

@Component({
  selector: 'app-discussion-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './discussion-report.html',
  styleUrl: './discussion-report.css'
})
export class DiscussionReport {

  // =====================================================
  // DEPENDENCIES
  // =====================================================

  private discussionService = inject(DiscussionService);
  private toastService = inject(ToastService);

  // =====================================================
  // INPUT AND OUTPUT
  // =====================================================

  @Input({ required: true }) discussionId!: number;

  @Output() reportSubmitted = new EventEmitter<void>();

  @Output() cancelReport = new EventEmitter<void>();

  // =====================================================
  // COMPONENT STATES
  // =====================================================

  reason = signal<string>('');

  description = signal<string>('');

  submitting = signal<boolean>(false);

  // =====================================================
  // SUBMIT REPORT
  // =====================================================

  submitReport(): void {

    if (!this.discussionId || this.discussionId <= 0) {
      this.toastService.error('Invalid discussion ID.');
      return;
    }

    if (!this.reason()) {
      this.toastService.error('Please select a report reason.');
      return;
    }

    if (this.description().length > 2000) {
      this.toastService.error('Description cannot exceed 2000 characters.');
      return;
    }

    this.submitting.set(true);

    this.discussionService.reportDiscussion(
      this.discussionId,
      this.reason(),
      this.description().trim()
    ).subscribe({

      next: (response) => {

        if (response.success) {

          this.toastService.success(
            response.message || 'Report submitted successfully.'
          );

          this.reason.set('');
          this.description.set('');

          this.reportSubmitted.emit();

        } else {

          this.toastService.error(
            response.message || 'Unable to submit report.'
          );

        }

        this.submitting.set(false);

      },

      error: (error) => {

        this.toastService.error(
          error.error?.message || 'Failed to submit report.'
        );

        this.submitting.set(false);

      }

    });

  }

  // =====================================================
  // CANCEL REPORT
  // =====================================================

  closeReport(): void {

    this.cancelReport.emit();

  }

}
