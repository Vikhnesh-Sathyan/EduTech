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
  MentorTheoryChallengeService
} from '../../../../../services/mentor/challenge-arena/theory/theory-challenge';

import { ToastService } from '../../../../../services/toast.service';

import {
  DeleteTheoryChallengeComponent
} from '../delete-theory-challenge/delete-theory-challenge';

@Component({
  selector: 'app-mentor-theory-challenge-list',
  standalone: true,
  imports: [
  CommonModule,
  DeleteTheoryChallengeComponent
],
  templateUrl: './theory-challenge-list.html',
  styleUrl: './theory-challenge-list.css'
})
export class TheoryChallengeList implements OnInit {

  private router = inject(Router);

  private theoryChallengeService =
    inject(MentorTheoryChallengeService);

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

  // Load mentor's theory challenges
  loadChallenges(): void {

    this.loading.set(true);

    this.theoryChallengeService.getMyTheoryChallenges().subscribe({

      next: (response) => {

        this.challenges.set(response.challenges || []);

        this.loading.set(false);

      },

      error: (error) => {

        console.error('Failed to load theory challenges:', error);

        this.toastService.error(
          'Failed to load theory challenges'
        );

        this.loading.set(false);

      }

    });

  }

  // Navigate to create page
  createChallenge(): void {

    this.router.navigate([
      '/mentor/challenge-arena/theory-challenges/create'
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
      '/mentor/challenge-arena/theory-challenges',
      challengeId
    ]);

  }

  // Edit challenge
  editChallenge(challengeId: number): void {

    this.closeMenu();

    this.router.navigate([
      '/mentor/challenge-arena/theory-challenges',
      challengeId,
      'edit'
    ]);

  }

  // Publish challenge
  publishChallenge(challengeId: number): void {

    this.publishingId.set(challengeId);

    this.theoryChallengeService
      .updateTheoryChallengeStatus(challengeId, 'published')
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

    this.theoryChallengeService
      .updateTheoryChallengeStatus(challengeId, 'draft')
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

}
