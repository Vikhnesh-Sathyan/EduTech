
import {
  Component,
  OnInit,
  HostListener,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  MentorCodingChallengeService
} from '../../../../../services/mentor/challenge-arena/coding/coding-challenge';

import {
  DeleteCodingChallengeComponent
} from '../delete-coding-challenge/delete-coding-challenge';

import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-mentor-coding-challenge-list',
  standalone: true,
  imports: [
  CommonModule,
  DeleteCodingChallengeComponent
],
  templateUrl: './coding-challenge-list.html',
  styleUrl: './coding-challenge-list.css'
})
export class CodingChallengeList implements OnInit {

  private router = inject(Router);

  private codingChallengeService =
    inject(MentorCodingChallengeService);

  private toastService = inject(ToastService);

  // Component state
  loading = signal(false);

  challenges = signal<any[]>([]);

  openMenuId = signal<number | null>(null);

  // PUBLISH / UNPUBLISH
  publishingId = signal<number | null>(null);

  unpublishingId = signal<number | null>(null);

  ngOnInit(): void {
    this.loadChallenges();
  }

  // Load mentor's coding challenges
  loadChallenges(): void {

    this.loading.set(true);

    this.codingChallengeService.getMyCodingChallenges().subscribe({

      next: (response) => {

        this.challenges.set(response.challenges || []);

        this.loading.set(false);

      },

      error: (error) => {

        console.error('Failed to load coding challenges:', error);

        this.toastService.error(
          'Failed to load coding challenges'
        );

        this.loading.set(false);

      }

    });

  }

  // Navigate to create page
  createChallenge(): void {

    this.router.navigate([
      '/mentor/challenge-arena/coding-challenges/create'
    ]);

  }

  // Open or close challenge menu
  toggleMenu(event: MouseEvent, challengeId: number): void {

    event.stopPropagation();

    this.openMenuId.update(current =>
      current === challengeId ? null : challengeId
    );

  }

  // Close menu when clicking outside
  @HostListener('document:click')
  closeMenu(): void {

    this.openMenuId.set(null);

  }

  // View challenge
  viewChallenge(challengeId: number): void {

    this.closeMenu();

    this.router.navigate([
      '/mentor/challenge-arena/coding-challenges',
      challengeId
    ]);

  }

  // Edit challenge
  editChallenge(challengeId: number): void {

    this.closeMenu();

    this.router.navigate([
      '/mentor/challenge-arena/coding-challenges',
      challengeId,
      'edit'
    ]);

  }

  // Publish challenge
publishChallenge(challengeId: number): void {

  this.publishingId.set(challengeId);

  this.codingChallengeService
    .updateCodingChallengeStatus(challengeId, 'published')
    .subscribe({

      next: (response) => {

        this.toastService.success(
          response.message || 'Challenge published successfully'
        );

        this.publishingId.set(null);

        this.loadChallenges();

      },

      error: (error) => {

        console.error(error);

        this.toastService.error(
          error.error?.message || 'Failed to publish challenge'
        );

        this.publishingId.set(null);

      }

    });

}


// Unpublish challenge (move back to draft)
unpublishChallenge(challengeId: number): void {

  this.unpublishingId.set(challengeId);

  this.codingChallengeService
    .updateCodingChallengeStatus(challengeId, 'draft')
    .subscribe({

      next: (response) => {

        this.toastService.success(
          response.message || 'Challenge unpublished successfully'
        );

        this.unpublishingId.set(null);

        this.loadChallenges();

      },

      error: (error) => {

        console.error(error);

        this.toastService.error(
          error.error?.message || 'Failed to unpublish challenge'
        );

        this.unpublishingId.set(null);

      }

    });

}

// View student submissions
viewSubmissions(challengeId: number): void {

  this.closeMenu();

  this.router.navigate([
    '/mentor/challenge-arena/coding-challenges',
    challengeId,
    'submissions'
  ]);

}
}
