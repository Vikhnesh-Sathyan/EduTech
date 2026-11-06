
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  MentorCodingChallengeService
} from '../../../../../services/mentor/challenge-arena/coding/coding-challenge';

@Component({
  selector: 'app-mentor-view-coding-challenge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-coding-challenge.html',
  styleUrl: './view-coding-challenge.css',
})
export class MentorViewCodingChallenge implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private challengeService = inject(MentorCodingChallengeService);

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
      .getCodingChallengeById(challengeId)
      .subscribe({

        next: (response: any) => {
          this.challenge.set(response.challenge || response);
          this.loading.set(false);
        },

        error: (error: any) => {
          console.error('Error loading mentor coding challenge:', error);
          this.loading.set(false);
        }

      });
  }

  // Navigate back to mentor coding challenge list
  goBack(): void {
    this.router.navigate([
      '/mentor/challenge-arena/coding-challenges'
    ]);
  }

}
