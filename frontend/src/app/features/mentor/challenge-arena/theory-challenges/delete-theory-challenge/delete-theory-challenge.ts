
import {
  Component,
  EventEmitter,
  Output,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  MentorTheoryChallengeService
} from '../../../../../services/mentor/challenge-arena/theory/theory-challenge';

import {
  ToastService
} from '../../../../../services/toast.service';

import {
  ConfirmModalComponent
} from '../../../../../shared/confirm-modal/confirm-modal';

@Component({
  selector: 'app-mentor-delete-theory-challenge',
  standalone: true,
  imports: [
    CommonModule,
    ConfirmModalComponent
  ],
  templateUrl: './delete-theory-challenge.html',
  styleUrl: './delete-theory-challenge.css'
})
export class DeleteTheoryChallengeComponent {

  @Output() deleted = new EventEmitter<void>();

  private theoryChallengeService =
    inject(MentorTheoryChallengeService);

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

  // Delete theory challenge
  deleteChallenge(): void {

    const challengeId = this.selectedChallengeId();

    if (!challengeId || this.deleting()) {
      return;
    }

    this.deleting.set(true);

    this.theoryChallengeService
      .deleteTheoryChallenge(challengeId)
      .subscribe({

        next: (response) => {

          this.toastService.success(
            response.message || 'Theory challenge deleted successfully'
          );

          this.deleting.set(false);
          this.closeDeleteModal();

          this.deleted.emit();

        },

        error: (error) => {

          console.error(
            'Mentor theory challenge deletion error:',
            error
          );

          this.toastService.error(
            error.error?.message || 'Failed to delete theory challenge'
          );

          this.deleting.set(false);

        }

      });
  }

}
