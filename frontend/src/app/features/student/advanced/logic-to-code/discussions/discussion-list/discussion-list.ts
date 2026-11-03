
import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import {
  DiscussionService,
  StudentDiscussion
} from '../../../../../../services/student/advanced/logic-to-code/discussion.service';

// Discussion child components
import { DiscussionCreate } from '../discussion-create/discussion-create';
import { DiscussionReply } from '../discussion-reply/discussion-reply';
import { DiscussionEdit } from '../discussion-edit/discussion-edit';
import { DiscussionDelete } from '../discussion-delete/discussion-delete';
import { DiscussionReport } from '../discussion-report/discussion-report';

@Component({
  selector: 'app-discussion-list',
  standalone: true,
  imports: [
    CommonModule,
    DiscussionCreate,
    DiscussionReply,
    DiscussionEdit,
    DiscussionDelete,
    DiscussionReport
  ],
  templateUrl: './discussion-list.html',
  styleUrl: './discussion-list.css'
})
export class DiscussionList implements OnInit {

  // =====================================================
  // DEPENDENCIES
  // =====================================================

  private route = inject(ActivatedRoute);
  private discussionService = inject(DiscussionService);

  // =====================================================
  // COMPONENT STATES
  // =====================================================

  currentUserId: number | null = null;

  loading = signal<boolean>(true);
  errorMessage = signal<string>('');
  discussions = signal<StudentDiscussion[]>([]);

  problemId = 0;

  replyingToId = signal<number | null>(null);
  editingDiscussionId = signal<number | null>(null);
  editingContent = signal<string>('');

  reportingDiscussionId = signal<number | null>(null);

  // =====================================================
  // INITIALIZE COMPONENT
  // =====================================================

  ngOnInit(): void {

    this.loadCurrentUser();

    this.problemId = Number(
      this.route.snapshot.paramMap.get('problemId')
    );

    if (!Number.isInteger(this.problemId) || this.problemId <= 0) {
      this.errorMessage.set('Invalid problem ID.');
      this.loading.set(false);
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

    this.discussionService.getDiscussions(this.problemId).subscribe({

      next: (response) => {

        if (response.success) {

          this.discussions.set(
            this.buildDiscussionTree(response.discussions || [])
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
  // BUILD DISCUSSION AND REPLY HIERARCHY
  // =====================================================

  private buildDiscussionTree(
    items: StudentDiscussion[]
  ): StudentDiscussion[] {

    const discussionMap = new Map<number, StudentDiscussion>();

    const roots: StudentDiscussion[] = [];

    items.forEach(item => {

      discussionMap.set(item.id, {
        ...item,
        replies: []
      });

    });

    discussionMap.forEach(discussion => {

      if (discussion.parent_id !== null) {

        const parent = discussionMap.get(discussion.parent_id);

        if (parent) {
          parent.replies!.push(discussion);
        } else {
          roots.push(discussion);
        }

      } else {

        roots.push(discussion);

      }

    });

    return roots;

  }

  // =====================================================
  // OPEN REPLY EDITOR
  // =====================================================

  openReply(discussionId: number): void {

    this.replyingToId.set(discussionId);
    this.editingDiscussionId.set(null);

  }

  // =====================================================
  // CLOSE REPLY EDITOR
  // =====================================================

  closeReply(): void {

    this.replyingToId.set(null);

  }

  // =====================================================
  // OPEN EDITOR
  // =====================================================

  openEdit(discussion: StudentDiscussion): void {

    this.editingDiscussionId.set(discussion.id);
    this.editingContent.set(discussion.content);
    this.replyingToId.set(null);

  }

  // =====================================================
  // CLOSE EDITOR
  // =====================================================

  closeEdit(): void {

    this.editingDiscussionId.set(null);
    this.editingContent.set('');

  }

  // =====================================================
  // CHECK DISCUSSION OWNERSHIP
  // =====================================================

  isOwnDiscussion(discussion: StudentDiscussion): boolean {

    return this.currentUserId !== null &&
      discussion.user_id === this.currentUserId;

  }

  // =====================================================
  // GET LOGGED-IN STUDENT ID
  // =====================================================

  private loadCurrentUser(): void {

    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      this.currentUserId = null;
      return;
    }

    try {

      const user = JSON.parse(storedUser);

      if (user.role === 'student' && Number(user.id) > 0) {
        this.currentUserId = Number(user.id);
      } else {
        this.currentUserId = null;
      }

    } catch {

      this.currentUserId = null;

    }

  }

  openReport(discussionId: number): void {
  this.reportingDiscussionId.set(discussionId);
}

closeReport(): void {
  this.reportingDiscussionId.set(null);
}

onReportSubmitted(): void {
  this.reportingDiscussionId.set(null);
}

}
