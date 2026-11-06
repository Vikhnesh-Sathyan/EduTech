import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  MentorCodingChallengeService,
  MentorCodingChallengeSubmission
} from '../../../../../services/mentor/challenge-arena/coding/coding-challenge';

import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-coding-challenge-submissions',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './coding-challenge-submissions.html',
  styleUrl: './coding-challenge-submissions.css'
})
export class CodingChallengeSubmissions implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private codingChallengeService =
    inject(MentorCodingChallengeService);

  private toastService = inject(ToastService);

  // Component state
  loading = signal(false);

  challengeId = signal<number | null>(null);

  submissions = signal<MentorCodingChallengeSubmission[]>([]);

  totalSubmissions = signal(0);

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('challengeId')
    );

    if (!id || Number.isNaN(id)) {

      this.toastService.error('Invalid challenge ID');

      this.goBack();

      return;

    }

    this.challengeId.set(id);

    this.loadSubmissions();

  }

  // Load student submissions
  loadSubmissions(): void {

    const id = this.challengeId();

    if (!id) {
      return;
    }

    this.loading.set(true);

    this.codingChallengeService
      .getChallengeSubmissions(id)
      .subscribe({

        next: (response) => {

          this.submissions.set(
            response.submissions || []
          );

          this.totalSubmissions.set(
            response.total || 0
          );

          this.loading.set(false);

        },

        error: (error) => {

          console.error(
            'Failed to load submissions:',
            error
          );

          this.toastService.error(
            error.error?.message ||
            'Failed to load student submissions'
          );

          this.loading.set(false);

        }

      });

  }

  // Navigate to submission review
reviewSubmission(attemptId: number): void {

  this.router.navigate([
    '/mentor/challenge-arena/coding-challenges',
    this.challengeId(),
    'submissions',
    attemptId
  ]);

}

  // Return to challenge list
  goBack(): void {

    this.router.navigate([
      '/mentor/challenge-arena/coding-challenges'
    ]);

  }

}