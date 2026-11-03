
import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
  OnInit
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
  selector: 'app-discussion-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './discussion-edit.html',
  styleUrl: './discussion-edit.css'
})
export class DiscussionEdit implements OnInit {

  // =====================================================
  // DEPENDENCIES
  // =====================================================

  private discussionService = inject(DiscussionService);
  private toastService = inject(ToastService);

  // =====================================================
  // INPUT AND OUTPUT
  // =====================================================

  @Input({ required: true }) discussionId!: number;
  @Input({ required: true }) existingContent = '';

  @Output() discussionUpdated = new EventEmitter<void>();
  @Output() cancelEdit = new EventEmitter<void>();

  // =====================================================
  // COMPONENT STATES
  // =====================================================

  content = signal<string>('');
  saving = signal<boolean>(false);

  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {
    this.content.set(this.existingContent);
  }

  // =====================================================
  // SAVE UPDATED DISCUSSION
  // =====================================================

  saveDiscussion(): void {

    const updatedContent = this.content().trim();

    if (!this.discussionId || this.discussionId <= 0) {
      this.toastService.error('Invalid discussion ID.');
      return;
    }

    if (!updatedContent) {
      this.toastService.error('Discussion content cannot be empty.');
      return;
    }

    this.saving.set(true);

    this.discussionService.updateDiscussion(
      this.discussionId,
      updatedContent
    ).subscribe({

      next: (response) => {

        if (response.success) {

          this.toastService.success(
            'Discussion updated successfully.'
          );

          this.discussionUpdated.emit();

        } else {

          this.toastService.error(
            response.message || 'Unable to update discussion.'
          );

        }

        this.saving.set(false);

      },

      error: (error) => {

        this.toastService.error(
          error.error?.message || 'Failed to update discussion.'
        );

        this.saving.set(false);

      }

    });

  }

  // =====================================================
  // CANCEL EDITING
  // =====================================================

  cancel(): void {
    this.cancelEdit.emit();
  }

}
