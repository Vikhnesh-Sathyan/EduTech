import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  MentorTheoryChallengeService
} from '../../../../../services/mentor/challenge-arena/theory/theory-challenge';

@Component({
  selector: 'app-submission-theory-challenge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './submission-theory-challenge.html',
  styleUrl: './submission-theory-challenge.css'
})
export class SubmissionTheoryChallengeComponent implements OnInit {

  submissions = signal<any[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  constructor(
    private readonly theoryService: MentorTheoryChallengeService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadSubmissions();
  }

  // ==========================================
  // LOAD MENTOR SUBMISSIONS
  // ==========================================

  loadSubmissions(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.theoryService.getMentorTheoryChallengeSubmissions().subscribe({

      next: (response: any) => {
        this.submissions.set(response.submissions || []);
        this.loading.set(false);
      },

      error: (error) => {
        this.errorMessage.set(
          error.error?.message || 'Failed to load submissions.'
        );
        this.loading.set(false);
      }

    });
  }

  // ==========================================
  // OPEN SUBMISSION FOR REVIEW
  // ==========================================

  reviewSubmission(attemptId: number): void {
    this.router.navigate([
      '/mentor/challenge-arena/theory-challenges/submissions',
      attemptId
    ]);
  }

  // ==========================================
  // STATUS LABEL
  // ==========================================

  getStatusLabel(status: string): string {

    switch (status) {
      case 'pending':
        return 'Pending Review';

      case 'reviewed':
        return 'Reviewed';

      case 'completed':
        return 'Completed';

      default:
        return status;
    }
  }

  // ==========================================
  // BACK
  // ==========================================

  goBack(): void {
    this.router.navigate([
      '/mentor/challenge-arena/theory-challenges'
    ]);
  }

}