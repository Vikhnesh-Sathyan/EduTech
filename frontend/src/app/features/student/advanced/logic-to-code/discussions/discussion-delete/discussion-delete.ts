
import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  DiscussionService
} from '../../../../../../services/student/advanced/logic-to-code/discussion.service';

import {
  ToastService
} from '../../../../../../services/toast.service';

import {
  ConfirmModalComponent
} from '../../../../../../shared/confirm-modal/confirm-modal';

@Component({
  selector: 'app-discussion-delete',
  standalone: true,
  imports: [
    CommonModule,
    ConfirmModalComponent
  ],
  templateUrl: './discussion-delete.html',
  styleUrl: './discussion-delete.css'
})
export class DiscussionDelete {

  // =====================================================
  // DEPENDENCIES
  // =====================================================

  private discussionService = inject(DiscussionService);
  private toastService = inject(ToastService);

  // =====================================================
  // INPUT AND OUTPUT
  // =====================================================

  @Input({ required: true }) discussionId!: number;

  @Output() discussionDeleted = new EventEmitter<void>();

  // =====================================================
  // COMPONENT STATES
  // =====================================================

  modalVisible = signal<boolean>(false);

  deleting = signal<boolean>(false);

  // =====================================================
  // OPEN CONFIRMATION MODAL
  // =====================================================

  openDeleteModal(): void {
    this.modalVisible.set(true);
  }

  // =====================================================
  // CANCEL DELETION
  // =====================================================

  cancelDelete(): void {
    if (this.deleting()) {
      return;
    }

    this.modalVisible.set(false);
  }

  // =====================================================
  // CONFIRM DELETION
  // =====================================================

  confirmDelete(): void {

    if (!this.discussionId || this.discussionId <= 0) {
      this.toastService.error('Invalid discussion ID.');
      return;
    }

    if (this.deleting()) {
      return;
    }

    this.deleting.set(true);

    this.discussionService.deleteDiscussion(
      this.discussionId
    ).subscribe({

      next: (response) => {

        if (response.success) {

          this.modalVisible.set(false);

          this.toastService.success(
            'Discussion deleted successfully.'
          );

          this.discussionDeleted.emit();

        } else {

          this.toastService.error(
            response.message || 'Unable to delete discussion.'
          );

        }

        this.deleting.set(false);

      },

      error: (error) => {

        this.toastService.error(
          error.error?.message || 'Failed to delete discussion.'
        );

        this.deleting.set(false);

      }

    });

  }

}
