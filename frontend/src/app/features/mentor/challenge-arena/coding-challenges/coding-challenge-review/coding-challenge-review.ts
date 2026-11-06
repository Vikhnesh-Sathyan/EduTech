import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  MentorCodingChallengeService,
  MentorCodingChallengeSubmission
} from '../../../../../services/mentor/challenge-arena/coding/coding-challenge';

import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-coding-challenge-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coding-challenge-review.html',
  styleUrl: './coding-challenge-review.css',
})
export class CodingChallengeReview implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private mentorService = inject(MentorCodingChallengeService);
  private toast = inject(ToastService);

  challengeId = signal<number>(0);
  attemptId = signal<number>(0);

  loading = signal<boolean>(true);
  submitting = signal<boolean>(false);

  submission = signal<MentorCodingChallengeSubmission | null>(null);

  reviewStatus = signal<'correct' | 'incorrect'>('correct');
  feedback = signal<string>('');

  ngOnInit(): void {
    const challengeId = Number(
      this.route.snapshot.paramMap.get('challengeId')
    );

    const attemptId = Number(
      this.route.snapshot.paramMap.get('attemptId')
    );

    if (!challengeId || !attemptId) {
      this.toast.error('Invalid submission details.');
      this.goBack();
      return;
    }

    this.challengeId.set(challengeId);
    this.attemptId.set(attemptId);

    this.loadSubmission();
  }

  loadSubmission(): void {
    this.loading.set(true);

    this.mentorService
      .getChallengeSubmissions(this.challengeId())
      .subscribe({
        next: (response) => {
          const selectedSubmission = response.submissions.find(
            item => item.attempt_id === this.attemptId()
          );

          if (!selectedSubmission) {
            this.toast.error('Submission not found.');
            this.goBack();
            return;
          }

          this.submission.set(selectedSubmission);
          this.feedback.set(selectedSubmission.feedback ?? '');

          this.loading.set(false);
        },
        error: () => {
          this.toast.error('Failed to load submission.');
          this.loading.set(false);
        }
      });
  }

  goBack(): void {
    this.router.navigate([
      '/mentor/challenge-arena/coding-challenges',
      this.challengeId(),
      'submissions'
    ]);
  }

  submitReview(): void {
  const currentSubmission = this.submission();

  if (!currentSubmission) {
    this.toast.error('Submission not found.');
    return;
  }

  const feedbackText = this.feedback().trim();

  if (!feedbackText) {
    this.toast.error('Please provide feedback.');
    return;
  }

  if (currentSubmission.result_status !== 'pending') {
    this.toast.error('This submission has already been reviewed.');
    return;
  }

  this.submitting.set(true);

  this.mentorService.reviewSubmission(
    this.attemptId(),
    {
      result_status: this.reviewStatus(),
      feedback: feedbackText
    }
  ).subscribe({
    next: (response) => {
      this.submitting.set(false);
      this.toast.success(response.message || 'Submission reviewed successfully.');
      this.goBack();
    },
    error: (error) => {
      this.submitting.set(false);
      this.toast.error(
        error.error?.message || 'Failed to submit review.'
      );
    }
  });
}
}