
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  StudentCodingChallengeService,
  StudentCodingChallengeAttempt
} from '../../../../../services/student/challenge-arena/coding/student-coding-challenge';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class History implements OnInit {

  private challengeService = inject(StudentCodingChallengeService);
  private router = inject(Router);

  submissions = signal<StudentCodingChallengeAttempt[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.challengeService.getAttemptHistory().subscribe({

      next: (response) => {
        this.submissions.set(response.attempts || []);
        this.loading.set(false);
      },

      error: (error) => {
        console.error('Failed to load submission history:', error);

        this.errorMessage.set(
          error.error?.message || 'Unable to load your submissions.'
        );

        this.loading.set(false);
      }

    });
  }

  viewResult(attemptId: number): void {
    this.router.navigate([
      '/student/challenge-arena/coding/result',
      attemptId
    ]);
  }

  goBack(): void {
    this.router.navigate(['/student/challenge-arena/coding']);
  }
}
