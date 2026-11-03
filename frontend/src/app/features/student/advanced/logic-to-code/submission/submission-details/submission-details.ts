
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  LogicToCodeService,
  StudentSubmissionDetails
} from '../../../../../../services/student/advanced/logic-to-code/logic-to-code.service';

@Component({
  selector: 'app-submission-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './submission-details.html',
  styleUrl: './submission-details.css'
})
export class SubmissionDetailsComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private logicToCodeService = inject(LogicToCodeService);

  // Submission data
  submission = signal<StudentSubmissionDetails | null>(null);

  // Page states
  loading = signal(true);
  errorMessage = signal('');

  // Star rating values
  readonly stars = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    const submissionId = Number(
      this.route.snapshot.paramMap.get('submissionId')
    );

    if (!Number.isInteger(submissionId) || submissionId <= 0) {
      this.errorMessage.set('Invalid submission ID.');
      this.loading.set(false);
      return;
    }

    this.loadSubmission(submissionId);
  }

  // Fetch submission details
  loadSubmission(submissionId: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.logicToCodeService
      .getSubmissionDetails(submissionId)
      .subscribe({
        next: (response) => {
          this.submission.set(response.data);
          this.loading.set(false);
        },
        error: (error) => {
          this.errorMessage.set(
            error.error?.message ||
            'Unable to load submission details.'
          );
          this.loading.set(false);
        }
      });
  }

  // Check whether mentor has reviewed the submission
  isReviewed(): boolean {
    return this.submission()?.review_status === 'reviewed';
  }

  // Return rating stars
  getRating(): number {
    return this.submission()?.star_rating || 0;
  }

  // Navigate back
  goBack(): void {
    this.router.navigate(['/student/advanced/logic-to-code']);
  }

}
