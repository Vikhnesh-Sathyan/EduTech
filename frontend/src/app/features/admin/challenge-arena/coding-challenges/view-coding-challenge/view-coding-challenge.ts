import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { CodingChallengeService } from '../../../../../services/admin/challenge-arena/coding/coding-challenge';

@Component({
  selector: 'app-view-coding-challenge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-coding-challenge.html',
  styleUrl: './view-coding-challenge.css',
})
export class ViewCodingChallenge implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private codingChallengeService = inject(CodingChallengeService);

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
      this.router.navigate(['/admin/challenge-arena/coding-challenges']);
      return;
    }

    this.loading.set(true);

    this.codingChallengeService
      .getCodingChallengeById(challengeId)
      .subscribe({

        next: (response: any) => {
          this.challenge.set(response.challenge || response);
          this.loading.set(false);
        },

        error: (error: any) => {
          console.error('Error loading coding challenge:', error);
          this.loading.set(false);
        }

      });
  }

  // Navigate back to coding challenge list
  goBack(): void {
    this.router.navigate(['/admin/challenge-arena/coding-challenges']);
  }

}
