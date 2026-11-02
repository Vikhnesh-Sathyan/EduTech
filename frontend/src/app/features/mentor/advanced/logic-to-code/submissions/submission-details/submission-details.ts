
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import {
  LogicToCodeSubmissionsService,
  LogicToCodeSubmissionDetails
} from '../../../../../../services/mentor/advanced/logic-to-code/logic-to-code-submissions.service';

@Component({
  selector: 'app-submission-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './submission-details.html',
  styleUrl: './submission-details.css'
})
export class SubmissionDetails implements OnInit {

  private submissionService = inject(LogicToCodeSubmissionsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  submission = signal<LogicToCodeSubmissionDetails | null>(null);

  loading = signal(false);
  savingFeedback = signal(false);

  errorMessage = signal('');
  feedbackMessage = signal('');

  mentorFeedback = signal('');

  ngOnInit(): void {
    const submissionId = Number(
      this.route.snapshot.paramMap.get('submissionId')
    );

    if (!Number.isInteger(submissionId) || submissionId <= 0) {
      this.errorMessage.set('Invalid submission ID.');
      return;
    }

    this.loadSubmission(submissionId);
  }

  // ==========================================
  // LOAD SUBMISSION DETAILS
  // ==========================================

  loadSubmission(submissionId: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.submissionService.getSubmissionDetails(submissionId).subscribe({
      next: (response) => {
        this.submission.set(response.submission);

        this.mentorFeedback.set(
          response.submission.mentor_feedback || ''
        );

        this.loading.set(false);
      },
      error: (error) => {
        console.error('Submission details error:', error);

        this.errorMessage.set(
          error.error?.message || 'Unable to load submission details.'
        );

        this.loading.set(false);
      }
    });
  }

  // ==========================================
  // FEEDBACK INPUT
  // ==========================================

  onFeedbackChange(value: string): void {
    this.mentorFeedback.set(value);
    this.feedbackMessage.set('');
  }

  // ==========================================
  // SAVE MENTOR FEEDBACK
  // ==========================================

  saveFeedback(): void {
    const currentSubmission = this.submission();

    if (!currentSubmission) {
      return;
    }

    const feedback = this.mentorFeedback().trim();

    if (!feedback) {
      this.feedbackMessage.set('Please enter your feedback.');
      return;
    }

    this.savingFeedback.set(true);
    this.feedbackMessage.set('');

    this.submissionService.updateFeedback(
      currentSubmission.id,
      feedback
    ).subscribe({
      next: (response) => {
        this.submission.update((current) =>
          current
            ? {
                ...current,
                mentor_feedback: feedback,
                review_status: 'reviewed',
                reviewed_at: new Date().toISOString()
              }
            : null
        );

        this.feedbackMessage.set(response.message);
        this.savingFeedback.set(false);
      },
      error: (error) => {
        console.error('Feedback save error:', error);

        this.feedbackMessage.set(
          error.error?.message || 'Unable to save feedback.'
        );

        this.savingFeedback.set(false);
      }
    });
  }

  // ==========================================
  // NAVIGATION
  // ==========================================

  goBack(): void {
    this.router.navigate([
      '/mentor/advanced/logic-to-code/submissions'
    ]);
  }

}
