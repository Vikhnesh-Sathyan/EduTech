import {
  Component,
  EventEmitter,
  Output,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  MentorCodingChallengeService
} from '../../../../../services/mentor/challenge-arena/coding/coding-challenge';

import {
  ToastService
} from '../../../../../services/toast.service';

import {
  ConfirmModalComponent
} from '../../../../../shared/confirm-modal/confirm-modal';

@Component({
  selector: 'app-mentor-delete-coding-challenge',
  standalone: true,
  imports: [
    CommonModule,
    ConfirmModalComponent
  ],
  templateUrl: './delete-coding-challenge.html',
  styleUrl: './delete-coding-challenge.css'
})
export class DeleteCodingChallengeComponent {

  @Output() deleted = new EventEmitter<void>();

  private codingChallengeService =
    inject(MentorCodingChallengeService);

  private toastService = inject(ToastService);

  visible = signal(false);

  deleting = signal(false);

  selectedChallengeId = signal<number | null>(null);

  // Open delete confirmation modal
  openDeleteModal(challengeId: number): void {
    this.selectedChallengeId.set(challengeId);
    this.visible.set(true);
  }

  // Close confirmation modal
  closeDeleteModal(): void {
    if (this.deleting()) return;

    this.visible.set(false);
    this.selectedChallengeId.set(null);
  }

  // Delete coding challenge
  deleteChallenge(): void {

    const challengeId = this.selectedChallengeId();

    if (!challengeId || this.deleting()) {
      return;
    }

    this.deleting.set(true);

    this.codingChallengeService
      .deleteCodingChallenge(challengeId)
      .subscribe({

        next: (response) => {

          this.toastService.success(
            response.message || 'Coding challenge deleted successfully'
          );

          this.deleting.set(false);
          this.closeDeleteModal();

          this.deleted.emit();

        },

        error: (error) => {

          console.error(
            'Mentor coding challenge deletion error:',
            error
          );

          this.toastService.error(
            error.error?.message || 'Failed to delete coding challenge'
          );

          this.deleting.set(false);

        }

      });
  }

}