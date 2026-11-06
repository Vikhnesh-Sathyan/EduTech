
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  StudentCodingChallengeAttemptResult,
  StudentCodingChallengeService
} from '../../../../../services/student/challenge-arena/coding/student-coding-challenge';

@Component({
  selector: 'app-coding-challenge-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coding-challenge-result.html',
  styleUrl: './coding-challenge-result.css'
})
export class CodingChallengeResult implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private challengeService = inject(StudentCodingChallengeService);

  // Submission result
  attempt = signal<StudentCodingChallengeAttemptResult | null>(null);

  // Page states
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  ngOnInit(): void {

    const attemptId = Number(
      this.route.snapshot.paramMap.get('attemptId')
    );

    if (!attemptId || isNaN(attemptId)) {
      this.errorMessage.set('Invalid submission ID.');
      this.loading.set(false);
      return;
    }

    this.loadResult(attemptId);
  }

  // Load student submission result
  loadResult(attemptId: number): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.challengeService.getAttemptResult(attemptId).subscribe({

      next: (response) => {

        this.attempt.set(response.attempt);
        this.loading.set(false);

      },

      error: (error) => {

        console.error('Failed to load submission result:', error);

        this.errorMessage.set(
          error.error?.message || 'Unable to load submission result.'
        );

        this.loading.set(false);

      }

    });

  }

  // Return to coding challenge list
  goBack(): void {

    this.router.navigate([
      '/student/challenge-arena/coding'
    ]);

  }

}
