
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  MentorTheoryChallengeService
} from '../../../../../services/mentor/challenge-arena/theory/theory-challenge';

@Component({
  selector: 'app-mentor-view-theory-challenge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-theory-challenge.html',
  styleUrl: './view-theory-challenge.css',
})
export class MentorViewTheoryChallenge implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private challengeService = inject(MentorTheoryChallengeService);

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
      this.goBack();
      return;
    }

    this.loading.set(true);

    this.challengeService
      .getTheoryChallengeById(challengeId)
      .subscribe({

        next: (response: any) => {
          this.challenge.set(response.challenge || response);
          this.loading.set(false);
        },

        error: (error: any) => {
          console.error('Error loading mentor theory challenge:', error);
          this.loading.set(false);
        }

      });
  }

  // Navigate back to mentor theory challenge list
  goBack(): void {
    this.router.navigate([
      '/mentor/challenge-arena/theory-challenges'
    ]);
  }

}
