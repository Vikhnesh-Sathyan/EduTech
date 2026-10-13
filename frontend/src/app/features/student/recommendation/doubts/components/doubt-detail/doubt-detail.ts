import {
  Component,
  inject,
  input,
  output,
  signal,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommunityDoubtService } from '../../../../../../services/student/community-doubt.service';

@Component({
  selector: 'app-doubt-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doubt-detail.html',
  styleUrl: './doubt-detail.css'
})
export class DoubtDetailComponent {
  private doubtService = inject(CommunityDoubtService);

  doubtId = input.required<number>();
  backToList = output<void>();

  doubt = signal<any | null>(null);
  replyText = signal('');
  loading = signal(false);
  submittingReply = signal(false);
  errorMessage = signal('');
  replyError = signal('');
  successMessage = signal('');

  constructor() {
    effect(() => {
      const id = this.doubtId();

      if (id > 0) {
        this.loadDoubt(id);
      }
    });
  }

  loadDoubt(id: number): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.replyError.set('');
    this.successMessage.set('');

    this.doubtService.getDoubtById(id).subscribe({
      next: (response: any) => {
        this.doubt.set(response.doubt || response);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Load doubt detail error:', error);

        this.errorMessage.set(
          error.error?.message ||
          'Unable to load this discussion. Please try again.'
        );

        this.loading.set(false);
      }
    });
  }

  submitReply(): void {
    const currentDoubt = this.doubt();
    const trimmedReply = this.replyText().trim();

    this.replyError.set('');
    this.successMessage.set('');

    if (!currentDoubt?.id) {
      this.replyError.set('The discussion could not be found.');
      return;
    }

    if (!trimmedReply) {
      this.replyError.set('Please enter a reply.');
      return;
    }

    this.submittingReply.set(true);

  this.doubtService.createReply(
  currentDoubt.id,
  trimmedReply
).subscribe({
      next: () => {
        this.replyText.set('');
        this.submittingReply.set(false);
        this.successMessage.set('Your reply was posted successfully.');
        this.loadDoubt(currentDoubt.id);
      },
      error: (error) => {
        console.error('Submit reply error:', error);

        this.replyError.set(
          error.error?.message ||
          'Unable to post your reply. Please try again.'
        );

        this.submittingReply.set(false);
      }
    });
  }

  goBack(): void {
    this.backToList.emit();
  }
}