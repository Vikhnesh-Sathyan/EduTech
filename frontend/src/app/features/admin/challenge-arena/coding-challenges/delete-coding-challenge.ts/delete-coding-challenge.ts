import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CodingChallengeService } from '../../../../../services/admin/challenge-arena/coding/coding-challenge';

import { ConfirmModalComponent } from '../../../../../shared/confirm-modal/confirm-modal';

import {
  Output,
  EventEmitter
} from '@angular/core';

@Component({
  selector: 'app-delete-coding-challenge',
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

  private codingChallengeService = inject(CodingChallengeService);

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

    this.visible.set(false);

    this.selectedChallengeId.set(null);
  }

  // Delete coding challenge
  deleteChallenge(): void {

    const challengeId = this.selectedChallengeId();

    if (!challengeId) {
      return;
    }

    this.deleting.set(true);

    this.codingChallengeService
      .deleteCodingChallenge(challengeId)
      .subscribe({

        next: (response: any) => {

          this.deleting.set(false);

  this.closeDeleteModal();

  this.deleted.emit();

          console.log(response.message);

          this.deleting.set(false);

          this.closeDeleteModal();

        },

        error: (error: any) => {

          console.error(
            'Error deleting coding challenge:',
            error
          );

          this.deleting.set(false);

        }

      });
  }

}
