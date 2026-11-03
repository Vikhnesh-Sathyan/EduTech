
import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import {
  MentorDiscussionService,
  MentorDiscussion
} from '../../../../../../services/mentor/advanced/logic-to-code/discussion.service';

import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-mentor-discussion-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './discussion-list.html',
  styleUrl: './discussion-list.css'
})
export class DiscussionList implements OnInit {

  private route = inject(ActivatedRoute);
  private discussionService = inject(MentorDiscussionService);
  private toast = inject(ToastService);

  // =====================================================
  // STATE
  // =====================================================

  problemId = 0;

  loading = signal(false);
  errorMessage = signal('');

  problemTitle = signal('');

  discussions = signal<MentorDiscussion[]>([]);

  // Reply
  replyingToId = signal<number | null>(null);
  replyContent = signal('');
  submittingReply = signal(false);

  // Delete
  deletingDiscussionId = signal<number | null>(null);

  // =====================================================
  // INITIALIZATION
  // =====================================================

  ngOnInit(): void {

    this.problemId = Number(
      this.route.snapshot.paramMap.get('problemId')
    );

    if (!Number.isInteger(this.problemId) || this.problemId <= 0) {
      this.errorMessage.set('Invalid problem ID.');
      return;
    }

    this.loadDiscussions();

  }

  // =====================================================
  // LOAD DISCUSSIONS
  // =====================================================

  loadDiscussions(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.discussionService
      .getDiscussions(this.problemId)
      .subscribe({

        next: (response) => {

          if (response.success) {

            this.discussions.set(
              this.buildDiscussionTree(response.discussions || [])
            );

            this.problemTitle.set(
              response.problem?.title || 'Problem Discussions'
            );

          } else {

            this.errorMessage.set(
              response.message || 'Unable to load discussions.'
            );

          }

          this.loading.set(false);

        },

        error: (error) => {

          this.errorMessage.set(
            error.error?.message || 'Failed to load discussions.'
          );

          this.loading.set(false);

        }

      });

  }

  // =====================================================
  // BUILD DISCUSSION TREE
  // =====================================================

  private buildDiscussionTree(
    items: MentorDiscussion[]
  ): MentorDiscussion[] {

    const discussionMap = new Map<number, MentorDiscussion>();

    const roots: MentorDiscussion[] = [];

    items.forEach(item => {

      discussionMap.set(item.id, {
        ...item,
        replies: []
      });

    });

    items.forEach(item => {

      const current = discussionMap.get(item.id)!;

      if (item.parent_id !== null) {

        const parent = discussionMap.get(item.parent_id);

        if (parent) {

          parent.replies!.push(current);

        } else {

          roots.push(current);

        }

      } else {

        roots.push(current);

      }

    });

    return roots;

  }

  // =====================================================
  // REPLY METHODS
  // =====================================================

  openReply(discussionId: number): void {

    this.replyingToId.set(discussionId);
    this.replyContent.set('');

  }

  closeReply(): void {

    this.replyingToId.set(null);
    this.replyContent.set('');

  }

  submitReply(discussionId: number): void {

    const content = this.replyContent().trim();

    if (!content) {
      this.toast.error('Please enter a reply.');
      return;
    }

    if (content.length > 5000) {
      this.toast.error('Reply cannot exceed 5000 characters.');
      return;
    }

    if (this.submittingReply()) {
      return;
    }

    this.submittingReply.set(true);

    this.discussionService
      .replyToDiscussion(
        this.problemId,
        discussionId,
        content
      )
      .subscribe({

        next: (response) => {

          this.toast.success(
            response.message || 'Reply posted successfully.'
          );

          this.closeReply();
          this.loadDiscussions();

          this.submittingReply.set(false);

        },

        error: (error) => {

          this.toast.error(
            error.error?.message || 'Failed to post reply.'
          );

          this.submittingReply.set(false);

        }

      });

  }

  // =====================================================
  // DELETE METHODS
  // =====================================================

  openDelete(discussionId: number): void {

    this.deletingDiscussionId.set(discussionId);

  }

  closeDelete(): void {

    this.deletingDiscussionId.set(null);

  }

  confirmDelete(discussionId: number): void {

    if (this.deletingDiscussionId() !== discussionId) {
      return;
    }

    this.discussionService
      .deleteDiscussion(
        this.problemId,
        discussionId
      )
      .subscribe({

        next: (response) => {

          this.toast.success(
            response.message || 'Discussion deleted successfully.'
          );

          this.closeDelete();
          this.loadDiscussions();

        },

        error: (error) => {

          this.toast.error(
            error.error?.message || 'Failed to delete discussion.'
          );

        }

      });

  }

}
