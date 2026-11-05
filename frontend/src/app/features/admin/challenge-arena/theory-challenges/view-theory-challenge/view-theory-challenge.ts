import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { TheoryChallengeService } from '../../../../../services/admin/challenge-arena/theory/theory-challenge';

@Component({
  selector: 'app-view-theory-challenge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-theory-challenge.html',
  styleUrl: './view-theory-challenge.css',
})
export class ViewTheoryChallenge implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private theoryChallengeService = inject(TheoryChallengeService);

  loading = signal(false);

  challenge = signal<any | null>(null);

  ngOnInit(): void {
    this.loadChallenge();
  }

  // Get challenge ID from URL and load its details
  loadChallenge(): void {

    const challengeId = Number(
      this.route.snapshot.paramMap.get('challengeId')
    );

    if (!challengeId || isNaN(challengeId)) {
      this.router.navigate(['/admin/challenge-arena/theory-challenges']);
      return;
    }

    this.loading.set(true);

    this.theoryChallengeService
      .getTheoryChallengeById(challengeId)
      .subscribe({

        next: (response: any) => {
          this.challenge.set(response.challenge || response);
          this.loading.set(false);
        },

        error: (error) => {
          console.error('Error loading theory challenge:', error);
          this.loading.set(false);
        }

      });
  }

  // Navigate back to challenge list
  goBack(): void {
    this.router.navigate(['/admin/challenge-arena/theory-challenges']);
  }

}