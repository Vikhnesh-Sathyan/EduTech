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
  InterviewPrepService
} from '../../../../../../services/student/interview-prep.service';

@Component({
  selector: 'app-prep-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prep-detail.html',
  styleUrl: './prep-detail.css'
})
export class PrepDetailComponent {
  private readonly prepService = inject(InterviewPrepService);

  postId = input.required<number>();
  back = output<void>();

  post = signal<InterviewPrep | null>(null);
  loading = signal(false);
  errorMessage = signal('');

  constructor() {
    effect(() => {
      const id = this.postId();
      this.loadPost(id);
    });
  }

  loadPost(id: number): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.post.set(null);

    this.prepService.getById(id).subscribe({
      next: (post: InterviewPrep) => {
        this.post.set(post);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading preparation details:', error);

        this.errorMessage.set(
          error?.error?.message ||
          'Unable to load this preparation post. Please try again.'
        );

        this.loading.set(false);
      }
    });
  }

  goBack(): void {
    this.back.emit();
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

  retry(): void {
    this.loadPost(this.postId());
  }
}
