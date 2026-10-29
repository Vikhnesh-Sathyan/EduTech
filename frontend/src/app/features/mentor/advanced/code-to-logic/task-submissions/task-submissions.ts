
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CodeToLogicService } from '../../../../../services/mentor/advanced/code-to-logic/code-to-logic.service';

interface CodeToLogicSubmission {
  id: number;
  task_id: number;
  student_id: number;
  explanation: string;
  submission_number: number;
  mentor_feedback: string | null;
  star_rating: number | null;
  review_status: 'pending' | 'reviewed';
  submitted_at: string;
  reviewed_at: string | null;
}

interface CodeToLogicTask {
  id: number;
  title: string;
}

@Component({
  selector: 'app-code-to-logic-task-submissions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './task-submissions.html',
  styleUrl: './task-submissions.css'
})
export class TaskSubmissionsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private codeToLogicService = inject(CodeToLogicService);

  task = signal<CodeToLogicTask | null>(null);
  submissions = signal<CodeToLogicSubmission[]>([]);

  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  feedbackDrafts: Record<number, string> = {};
  ratingDrafts: Record<number, number> = {};

  reviewingSubmissionId = signal<number | null>(null);

  readonly ratings = [1, 2, 3, 4, 5];

  get totalSubmissions(): number {
    return this.submissions().length;
  }

  get pendingSubmissions(): number {
    return this.submissions().filter(
      submission => submission.review_status === 'pending'
    ).length;
  }

  get reviewedSubmissions(): number {
    return this.submissions().filter(
      submission => submission.review_status === 'reviewed'
    ).length;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const taskId = Number(params.get('taskId'));

      if (!Number.isInteger(taskId) || taskId <= 0) {
        this.errorMessage.set('Invalid task ID.');
        return;
      }

      this.loadSubmissions(taskId);
    });
  }

  loadSubmissions(taskId: number): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.codeToLogicService.getTaskSubmissions(taskId).subscribe({
      next: (response: any) => {
        this.task.set(response.task ?? null);

        const list: CodeToLogicSubmission[] =
          response.submissions ?? [];

        this.submissions.set(list);

        // Prepare editable values for pending submissions.
        for (const submission of list) {
          if (submission.review_status === 'pending') {
            this.feedbackDrafts[submission.id] =
              submission.mentor_feedback ?? '';

            this.ratingDrafts[submission.id] =
              submission.star_rating ?? 5;
          }
        }

        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load submissions:', error);
        this.errorMessage.set(
          error.error?.message ?? 'Unable to load submissions.'
        );
        this.loading.set(false);
      }
    });
  }

  setRating(submissionId: number, rating: number): void {
    this.ratingDrafts[submissionId] = rating;
  }

  submitReview(submission: CodeToLogicSubmission): void {
    if (submission.review_status === 'reviewed') {
      return;
    }

    const feedback =
      (this.feedbackDrafts[submission.id] ?? '').trim();

    const rating = this.ratingDrafts[submission.id];

    if (!feedback) {
      this.errorMessage.set('Please enter feedback before submitting.');
      this.successMessage.set('');
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      this.errorMessage.set('Please select a rating from 1 to 5.');
      this.successMessage.set('');
      return;
    }

    this.reviewingSubmissionId.set(submission.id);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.codeToLogicService.reviewSubmission(
      submission.id,
      {
        mentor_feedback: feedback,
        star_rating: rating
      }
    ).subscribe({
      next: () => {
        this.successMessage.set('Review submitted successfully.');

        const taskId = this.task()?.id;

        if (taskId) {
          this.loadSubmissions(taskId);
        } else {
          this.reviewingSubmissionId.set(null);
        }
      },
      error: (error) => {
        console.error('Failed to submit review:', error);

        this.errorMessage.set(
          error.error?.message ?? 'Failed to submit review.'
        );

        this.reviewingSubmissionId.set(null);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/mentor/advanced/code-to-logic/tasks']);
  }
}
