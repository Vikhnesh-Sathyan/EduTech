
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  MentorTheoryChallengeService
} from '../../../../../services/mentor/challenge-arena/theory/theory-challenge';

@Component({
  selector: 'app-review-theory-challenge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-theory-challenge.html',
  styleUrl: './review-theory-challenge.css'
})
export class ReviewTheoryChallengeComponent implements OnInit {

  submission = signal<any>(null);

  loading = signal<boolean>(true);
  submitting = signal<boolean>(false);

  questionText = signal<string>('');

  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  feedback = signal<string>('');

  criteria = signal([
    {
      key: 'concept_understanding',
      label: 'Concept Understanding',
      score: 0,
      max_score: 2.5,
      selected: true
    },
    {
      key: 'clarity_of_explanation',
      label: 'Clarity of Explanation',
      score: 0,
      max_score: 2.5,
      selected: true
    },
    {
      key: 'examples_reasoning',
      label: 'Examples & Reasoning',
      score: 0,
      max_score: 2.5,
      selected: true
    },
    {
      key: 'technical_accuracy',
      label: 'Technical Accuracy',
      score: 0,
      max_score: 2.5,
      selected: true
    }
  ]);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly theoryService: MentorTheoryChallengeService
  ) {}

  ngOnInit(): void {
    this.loadSubmission();
  }

  // ==========================================
  // LOAD SELECTED SUBMISSION
  // ==========================================

  loadSubmission(): void {

    const attemptId = Number(
      this.route.snapshot.paramMap.get('attemptId')
    );

    if (!Number.isInteger(attemptId) || attemptId <= 0) {
      this.errorMessage.set('Invalid submission ID.');
      this.loading.set(false);
      return;
    }

    this.theoryService.getMentorTheoryChallengeSubmissions().subscribe({

      next: (response: any) => {

        const selectedSubmission = (response.submissions || [])
          .find((item: any) => Number(item.attempt_id) === attemptId);

        if (!selectedSubmission) {
          this.errorMessage.set('Submission not found.');
          this.loading.set(false);
          return;
        }

        this.submission.set(selectedSubmission);

        this.questionText.set(
  this.getChallengeQuestion(selectedSubmission.challenge_content)
);

        // Restore existing review details for read-only viewing
        if (selectedSubmission.evaluation_details) {

          let savedCriteria = selectedSubmission.evaluation_details;

          if (typeof savedCriteria === 'string') {
            try {
              savedCriteria = JSON.parse(savedCriteria);
            } catch {
              savedCriteria = {};
            }
          }

          this.criteria.update(current =>
            current.map(item => ({
              ...item,
              score: Number(savedCriteria[item.key]?.score ?? 0)
            }))
          );
        }

        this.feedback.set(selectedSubmission.feedback || '');

        this.loading.set(false);
      },

      error: (error) => {
        this.errorMessage.set(
          error.error?.message || 'Failed to load submission.'
        );
        this.loading.set(false);
      }

    });
  }

  // ==========================================
  // UPDATE CRITERION SCORE
  // ==========================================

  updateScore(key: string, value: string): void {

    const score = Number(value);

    if (!Number.isFinite(score)) {
      return;
    }

    this.criteria.update(current =>
      current.map(item =>
        item.key === key
          ? {
              ...item,
              score: Math.min(2.5, Math.max(0, score))
            }
          : item
      )
    );
  }

  // ==========================================
  // UPDATE MENTOR FEEDBACK
  // ==========================================

  updateFeedback(value: string): void {
    this.feedback.set(value);
  }

  // ==========================================
  // CALCULATE TOTAL SCORE
  // ==========================================

  getTotalScore(): number {

    return Number(
      this.criteria()
        .reduce((total, item) => total + item.score, 0)
        .toFixed(2)
    );
  }

  // ==========================================
  // SUBMIT MENTOR REVIEW
  // ==========================================

  submitReview(): void {

    const currentSubmission = this.submission();

    if (!currentSubmission || currentSubmission.result_status !== 'pending') {
      return;
    }

    if (!this.feedback().trim()) {
      this.errorMessage.set('Please enter feedback for the student.');
      return;
    }

    const criteriaPayload: Record<string, any> = {};

    this.criteria().forEach(item => {
      criteriaPayload[item.key] = {
        selected: true,
        score: item.score,
        max_score: item.max_score
      };
    });

    this.submitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.theoryService.reviewTheoryChallengeSubmission(
      Number(currentSubmission.attempt_id),
      {
        criteria: criteriaPayload,
        feedback: this.feedback().trim()
      }
    ).subscribe({

      next: (response: any) => {

        this.successMessage.set(
          response.message || 'Submission reviewed successfully.'
        );

        this.submission.update(current => ({
          ...current,
          score: response.review.score,
          evaluation_details: response.review.evaluation_details,
          feedback: response.review.feedback,
          result_status: response.review.result_status
        }));

        this.submitting.set(false);
      },

      error: (error) => {
        this.errorMessage.set(
          error.error?.message || 'Failed to submit review.'
        );

        this.submitting.set(false);
      }

    });
  }

  // ==========================================
// EXTRACT ORIGINAL CHALLENGE QUESTION
// ==========================================

getChallengeQuestion(content: any): string {

  if (!content) {
    return 'Question details are not available.';
  }

  let challengeContent = content;

  if (typeof challengeContent === 'string') {
    try {
      challengeContent = JSON.parse(challengeContent);
    } catch {
      return challengeContent;
    }
  }

  return (
    challengeContent.question ||
    challengeContent.technical_statement ||
    challengeContent.given_explanation ||
    challengeContent.instructions ||
    'Question details are not available.'
  );
}

  // ==========================================
  // BACK TO SUBMISSIONS
  // ==========================================

  goBack(): void {

    this.router.navigate([
      '/mentor/challenge-arena/theory-challenges/submissions'
    ]);
  }

}
