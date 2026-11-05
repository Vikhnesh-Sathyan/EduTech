
import {
  Component,
  OnInit,
  HostListener,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { TheoryChallengeService } from '../../../../../services/admin/challenge-arena/theory/theory-challenge';

import { ToastService } from '../../../../../services/toast.service';
import { ConfirmModalComponent } from '../../../../../shared/confirm-modal/confirm-modal';

@Component({
  selector: 'app-theory-challenge-list',
  standalone: true,
  imports: [
    CommonModule,
    ConfirmModalComponent
  ],
  templateUrl: './theory-challenge-list.html',
  styleUrl: './theory-challenge-list.css',
})
export class TheoryChallengeList implements OnInit {

  private router = inject(Router);
  private theoryChallengeService = inject(TheoryChallengeService);
  private toastService = inject(ToastService);

  loading = signal(false);
  challenges = signal<any[]>([]);
  openMenuId = signal<number | null>(null);

  // DELETE MODAL
  showDeleteModal = signal(false);
  selectedChallenge = signal<any | null>(null);
  deleting = signal(false);

  // PUBLISH / UNPUBLISH
  publishingId = signal<number | null>(null);
  unpublishingId = signal<number | null>(null);

  showPublishModal = signal(false);
  selectedPublishChallengeId = signal<number | null>(null);

  // Track which action the existing confirmation modal represents
  publishAction = signal<'publish' | 'unpublish'>('publish');

  ngOnInit(): void {
    this.loadChallenges();
  }

  // LOAD CHALLENGES
  loadChallenges(): void {
    this.loading.set(true);

    this.theoryChallengeService.getTheoryChallenges().subscribe({
      next: (response: any) => {
        this.challenges.set(response.challenges || []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.toastService.error('Failed to load theory challenges');
        this.loading.set(false);
      }
    });
  }

  // CREATE CHALLENGE
  createChallenge(): void {
    this.router.navigate([
      '/admin/challenge-arena/theory-challenges/create'
    ]);
  }

  // TOGGLE DROPDOWN
  toggleMenu(event: MouseEvent, challengeId: number): void {
    event.stopPropagation();

    this.openMenuId.update(current =>
      current === challengeId ? null : challengeId
    );
  }

  // CLOSE DROPDOWN
  @HostListener('document:click')
  closeMenu(): void {
    this.openMenuId.set(null);
  }

  // VIEW CHALLENGE
  viewChallenge(challengeId: number): void {
    this.closeMenu();

    this.router.navigate([
      '/admin/challenge-arena/theory-challenges',
      challengeId
    ]);
  }

  // EDIT CHALLENGE
  editChallenge(challengeId: number): void {
    this.closeMenu();

    this.router.navigate([
      '/admin/challenge-arena/theory-challenges',
      challengeId,
      'edit'
    ]);
  }

  // OPEN DELETE MODAL
  openDeleteModal(challenge: any): void {
    this.selectedChallenge.set(challenge);
    this.showDeleteModal.set(true);
  }

  // CLOSE DELETE MODAL
  closeDeleteModal(): void {
    if (this.deleting()) return;

    this.showDeleteModal.set(false);
    this.selectedChallenge.set(null);
  }

  // DELETE CHALLENGE
  deleteChallenge(): void {
    const challenge = this.selectedChallenge();

    if (!challenge || this.deleting()) return;

    this.deleting.set(true);

    this.theoryChallengeService
      .deleteTheoryChallenge(challenge.id)
      .subscribe({
        next: (response) => {
          this.deleting.set(false);
          this.showDeleteModal.set(false);
          this.selectedChallenge.set(null);

          this.toastService.success(
            response.message || 'Theory challenge deleted successfully'
          );

          this.loadChallenges();
        },
        error: (error) => {
          this.deleting.set(false);

          this.toastService.error(
            error.error?.message || 'Failed to delete theory challenge'
          );

          this.showDeleteModal.set(false);
          this.selectedChallenge.set(null);
        }
      });
  }

  // OPEN PUBLISH MODAL
  publishChallenge(challengeId: number): void {
    if (this.publishingId() !== null || this.unpublishingId() !== null) {
      return;
    }

    this.publishAction.set('publish');
    this.selectedPublishChallengeId.set(challengeId);
    this.showPublishModal.set(true);
  }

  // OPEN UNPUBLISH MODAL
  unpublishChallenge(challengeId: number): void {
    if (this.publishingId() !== null || this.unpublishingId() !== null) {
      return;
    }

    this.publishAction.set('unpublish');
    this.selectedPublishChallengeId.set(challengeId);
    this.showPublishModal.set(true);
  }

  // CONFIRM PUBLISH / UNPUBLISH
  confirmPublishChallenge(): void {
    const challengeId = this.selectedPublishChallengeId();
    const action = this.publishAction();

    if (
      challengeId === null ||
      this.publishingId() !== null ||
      this.unpublishingId() !== null
    ) {
      return;
    }

    if (action === 'publish') {
      this.publishingId.set(challengeId);
    } else {
      this.unpublishingId.set(challengeId);
    }

    const newStatus = action === 'publish' ? 'published' : 'draft';

    this.theoryChallengeService
      .updateTheoryChallengeStatus(challengeId, newStatus)
      .subscribe({
        next: (response) => {
          this.publishingId.set(null);
          this.unpublishingId.set(null);
          this.showPublishModal.set(false);
          this.selectedPublishChallengeId.set(null);

          this.toastService.success(
            response.message ||
            (action === 'publish'
              ? 'Theory Challenge published successfully'
              : 'Theory Challenge unpublished successfully')
          );

          this.loadChallenges();
        },
        error: (error) => {
          this.publishingId.set(null);
          this.unpublishingId.set(null);

          this.toastService.error(
            error.error?.message ||
            (action === 'publish'
              ? 'Failed to publish theory challenge'
              : 'Failed to unpublish theory challenge')
          );
        }
      });
  }

  // CLOSE PUBLISH / UNPUBLISH MODAL
  closePublishModal(): void {
    if (
      this.publishingId() !== null ||
      this.unpublishingId() !== null
    ) {
      return;
    }

    this.showPublishModal.set(false);
    this.selectedPublishChallengeId.set(null);
    this.publishAction.set('publish');
  }
}
