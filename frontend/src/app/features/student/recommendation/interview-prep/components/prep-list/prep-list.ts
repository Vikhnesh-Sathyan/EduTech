import {
  Component,
  inject,
  input,
  output,
  signal,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  InterviewPrep,
  InterviewPrepFilters,
  InterviewPrepService
} from '../../../../../../services/student/interview-prep.service';

@Component({
  selector: 'app-prep-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prep-list.html',
  styleUrl: './prep-list.css'
})
export class PrepListComponent {
  private readonly prepService = inject(InterviewPrepService);

  filters = input<InterviewPrepFilters>({});

  postSelected = output<number>();

  posts = signal<InterviewPrep[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  constructor() {
    effect(() => {
      const currentFilters = this.filters();
      this.loadPosts(currentFilters);
    });
  }

  loadPosts(filters: InterviewPrepFilters = {}): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.prepService.getAll(filters).subscribe({
      next: (posts) => {
        this.posts.set(posts);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load interview preparation posts:', error);

        this.errorMessage.set(
          'Unable to load preparation posts. Please try again.'
        );

        this.loading.set(false);
      }
    });
  }

  openPost(post: InterviewPrep): void {
    this.postSelected.emit(post.id);
  }

  getTypeLabel(type: InterviewPrep['prep_type']): string {
    const labels: Record<InterviewPrep['prep_type'], string> = {
      technical_question: 'Technical Question',
      coding_challenge: 'Coding Challenge',
      hr_question: 'HR Question',
      interview_experience: 'Interview Experience',
      preparation_tip: 'Preparation Tip'
    };

    return labels[type];
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
    const normalized = content.replace(/\s+/g, ' ').trim();

    return normalized.length > 180
      ? `${normalized.slice(0, 180)}...`
      : normalized;
  }

  trackById(_index: number, post: InterviewPrep): number {
    return post.id;
  }
}