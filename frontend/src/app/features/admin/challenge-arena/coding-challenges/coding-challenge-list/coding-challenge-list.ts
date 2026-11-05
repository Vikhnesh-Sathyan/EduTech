
import {
  Component,
  OnInit,
  HostListener,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { CodingChallengeService } from '../../../../../services/admin/challenge-arena/coding/coding-challenge';

import { ToastService } from '../../../../../services/toast.service';
import { ConfirmModalComponent } from '../../../../../shared/confirm-modal/confirm-modal';

import { DeleteCodingChallengeComponent } from '../delete-coding-challenge.ts/delete-coding-challenge';

@Component({
  selector: 'app-coding-challenge-list',
  standalone: true,
  imports: [
    CommonModule,
    ConfirmModalComponent,
    DeleteCodingChallengeComponent
  ],
  templateUrl: './coding-challenge-list.html',
  styleUrl: './coding-challenge-list.css',
})
export class CodingChallengeList implements OnInit {

  private router = inject(Router);
  private codingChallengeService = inject(CodingChallengeService);
  private toastService = inject(ToastService);

  loading = signal(false);
  challenges = signal<any[]>([]);
  openMenuId = signal<number | null>(null);

  // PUBLISH / UNPUBLISH
  publishingId = signal<number | null>(null);
  unpublishingId = signal<number | null>(null);

  showPublishModal = signal(false);
  selectedPublishChallengeId = signal<number | null>(null);

  publishAction = signal<'publish' | 'unpublish'>('publish');

  ngOnInit(): void {
    this.loadChallenges();
  }

  // LOAD CODING CHALLENGES
  loadChallenges(): void {
    this.loading.set(true);

    this.codingChallengeService.getCodingChallenges().subscribe({
      next: (response: any) => {
        this.challenges.set(response.challenges || []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.toastService.error('Failed to load coding challenges');
        this.loading.set(false);
      }
    });
  }

  // CREATE CHALLENGE
  createChallenge(): void {
    this.router.navigate([
      '/admin/challenge-arena/coding-challenges/create'
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
      '/admin/challenge-arena/coding-challenges',
      challengeId
    ]);
  }

  // EDIT CHALLENGE
  editChallenge(challengeId: number): void {
    this.closeMenu();

    this.router.navigate([
      '/admin/challenge-arena/coding-challenges',
      challengeId,
      'edit'
    ]);
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

    this.codingChallengeService
      .updateCodingChallengeStatus(challengeId, newStatus)
      .subscribe({
        next: (response: any) => {
          this.publishingId.set(null);
          this.unpublishingId.set(null);
          this.showPublishModal.set(false);
          this.selectedPublishChallengeId.set(null);

          this.toastService.success(
            response.message ||
            (action === 'publish'
              ? 'Coding Challenge published successfully'
              : 'Coding Challenge unpublished successfully')
          );

          this.loadChallenges();
        },
        error: (error) => {
          this.publishingId.set(null);
          this.unpublishingId.set(null);

          this.toastService.error(
            error.error?.message ||
            (action === 'publish'
              ? 'Failed to publish coding challenge'
              : 'Failed to unpublish coding challenge')
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

  // HANDLE SUCCESSFUL DELETION
onChallengeDeleted(): void {
  this.toastService.success('Coding Challenge deleted successfully');
  this.loadChallenges();
}
}
