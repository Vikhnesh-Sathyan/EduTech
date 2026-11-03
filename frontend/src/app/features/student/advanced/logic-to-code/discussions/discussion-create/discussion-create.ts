
import { Component, inject, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DiscussionService } from '../../../../../../services/student/advanced/logic-to-code/discussion.service';

@Component({
  selector: 'app-discussion-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './discussion-create.html',
  styleUrl: './discussion-create.css'
})
export class DiscussionCreate {

  // =====================================================
  // DEPENDENCIES
  // =====================================================

  private discussionService = inject(DiscussionService);

  // =====================================================
  // INPUT AND OUTPUT
  // =====================================================

  @Input({ required: true }) problemId!: number;

  @Output() discussionCreated = new EventEmitter<void>();

  // =====================================================
  // COMPONENT STATES
  // =====================================================

  content = signal<string>('');

  submitting = signal<boolean>(false);

  errorMessage = signal<string>('');

  successMessage = signal<string>('');

  // =====================================================
  // CREATE DISCUSSION
  // =====================================================

  createDiscussion(): void {

    const discussionContent = this.content().trim();

    if (!this.problemId || this.problemId <= 0) {
      this.errorMessage.set('Invalid problem ID.');
      return;
    }

    if (!discussionContent) {
      this.errorMessage.set('Please enter your discussion.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.discussionService.createDiscussion(
      this.problemId,
      discussionContent
    ).subscribe({

      next: (response) => {

        if (response.success) {

          this.content.set('');

          this.successMessage.set('Discussion posted successfully.');

          this.discussionCreated.emit();

        } else {

          this.errorMessage.set(
            response.message || 'Unable to create discussion.'
          );

        }

        this.submitting.set(false);

      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message || 'Failed to post discussion.'
        );

        this.submitting.set(false);

      }

    });

  }

}
