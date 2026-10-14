import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  InterviewPrep,
  InterviewPrepService
} from '../../../../../../services/student/interview-prep.service';

@Component({
  selector: 'app-my-prep',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-prep.html',
  styleUrl: './my-prep.css'
})
export class MyPrepComponent {
  private readonly prepService = inject(InterviewPrepService);

  postSelected = output<number>();
  editRequested = output<number>();

  posts = signal<InterviewPrep[]>([]);
  loading = signal(false);
  errorMessage = signal('');
  deletingId = signal<number | null>(null);
  successMessage = signal('');

  constructor() {
    this.loadMyPosts();
  }

  loadMyPosts(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.prepService.getMyPosts().subscribe({
      next: (posts: InterviewPrep[]) => {
        this.posts.set(posts);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading your preparation posts:', error);

        this.errorMessage.set(
          error?.error?.message ||
          'Unable to load your posts. Please try again.'
        );

        this.loading.set(false);
      }
    });
  }

  openPost(post: InterviewPrep): void {
    this.postSelected.emit(post.id);
  }

  editPost(post: InterviewPrep): void {
    this.editRequested.emit(post.id);
  }

  deletePost(post: InterviewPrep): void {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${post.title}"? This action cannot be undone.`
    );

    if (!confirmed || this.deletingId() !== null) {
      return;
    }

    this.deletingId.set(post.id);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.prepService.delete(post.id).subscribe({
      next: () => {
        this.posts.update(currentPosts =>
          currentPosts.filter(item => item.id !== post.id)
        );

        this.deletingId.set(null);
        this.successMessage.set('Preparation post deleted successfully.');
      },
      error: (error) => {
        console.error('Error deleting preparation post:', error);

        this.errorMessage.set(
          error?.error?.message ||
          'Unable to delete this post. Please try again.'
        );

        this.deletingId.set(null);
      }
    });
  }

  getTypeLabel(type: InterviewPrep['prep_type']): string {
    const labels: Record<InterviewPrep['prep_type'], string> = {
      technical_question: 'Technical Question',
      coding_challenge: 'Coding Challenge',
      hr_question: 'HR Question',
      interview_experience: 'Interview Experience',
      preparation_tip: 'Preparation Tip'
    };

    return labels[type] || 'Preparation';
  }

  getDifficultyLabel(
    difficulty: InterviewPrep['difficulty']
  ): string {
    if (!difficulty) {
      return 'All Levels';
    }

    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  }

  getContentPreview(content: string): string {
    const text = (content || '').replace(/\s+/g, ' ').trim();

    return text.length > 150
      ? `${text.slice(0, 150)}...`
      : text;
  }

  trackById(_index: number, post: InterviewPrep): number {
    return post.id;
  }
}
