
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

@Component({
  selector: 'app-discussion-reply',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './discussion-reply.html',
  styleUrl: './discussion-reply.css'
})
export class DiscussionReply {

  // =====================================================
  // DEPENDENCIES
  // =====================================================

  private discussionService = inject(DiscussionService);

  // =====================================================
  // INPUT AND OUTPUT
  // =====================================================

  @Input({ required: true }) problemId!: number;

  @Input({ required: true }) parentId!: number;

  @Output() replyCreated = new EventEmitter<void>();

  // =====================================================
  // COMPONENT STATES
  // =====================================================

  content = signal<string>('');

  submitting = signal<boolean>(false);

  errorMessage = signal<string>('');

  successMessage = signal<string>('');

  // =====================================================
  // CREATE REPLY
  // =====================================================

  createReply(): void {

    const replyContent = this.content().trim();

    if (!this.problemId || this.problemId <= 0) {
      this.errorMessage.set('Invalid problem ID.');
      return;
    }

    if (!this.parentId || this.parentId <= 0) {
      this.errorMessage.set('Invalid discussion reference.');
      return;
    }

    if (!replyContent) {
      this.errorMessage.set('Please enter your reply.');
      return;
    }

    this.submitting.set(true);

    this.errorMessage.set('');

    this.successMessage.set('');

    this.discussionService.createDiscussion(
      this.problemId,
      replyContent,
      this.parentId
    ).subscribe({

      next: (response) => {

        if (response.success) {

          this.content.set('');

          this.successMessage.set('Reply posted successfully.');

          this.replyCreated.emit();

        } else {

          this.errorMessage.set(
            response.message || 'Unable to post reply.'
          );

        }

        this.submitting.set(false);

      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message || 'Failed to post reply.'
        );

        this.submitting.set(false);

      }

    });

  }

}
