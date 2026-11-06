
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import {
  StudentTheoryChallengeService
} from '../../../../../services/student/challenge-arena/theory/student-theory-challenge';

interface EvaluationCriterion {
  selected: boolean;
  score: number;
  max_score: number;
}

interface TheoryChallengeResult {
  id: number;
  challenge_id: number;
  attempt_number: number;
  submitted_content: any;
  score: number | null;
  evaluation_details: any;
  feedback: string | null;
  result_status: 'pending' | 'reviewed' | 'completed';
  submitted_at: string;
  reviewed_at: string | null;
  challenge_title: string;
  difficulty: string;
  instructions: string;
  subject_name: string;
  challenge_type_name: string;
  reviewer_name: string | null;
}

@Component({
  selector: 'app-theory-result',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './theory-result.html',
  styleUrl: './theory-result.css'
})
export class TheoryResult implements OnInit {

  private route = inject(ActivatedRoute);
  private theoryService = inject(StudentTheoryChallengeService);

  result = signal<TheoryChallengeResult | null>(null);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  criteriaList = [
    {
      key: 'concept_understanding',
      label: 'Concept Understanding'
    },
    {
      key: 'clarity_of_explanation',
      label: 'Clarity of Explanation'
    },
    {
      key: 'examples_reasoning',
      label: 'Examples & Reasoning'
    },
    {
      key: 'technical_accuracy',
      label: 'Technical Accuracy'
    }
  ];

  ngOnInit(): void {
    const attemptId = Number(
      this.route.snapshot.paramMap.get('attemptId')
    );

    if (!attemptId || attemptId <= 0) {
      this.errorMessage.set('Invalid attempt ID.');
      this.loading.set(false);
      return;
    }

    this.loadAttemptResult(attemptId);
  }

  // LOAD ATTEMPT RESULT
  loadAttemptResult(attemptId: number): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.theoryService
      .getTheoryChallengeAttemptResult(attemptId)
      .subscribe({

        next: (response: any) => {

          const data = response.result || response.attempt || response;

          this.result.set(data);
          this.loading.set(false);

        },

        error: (error) => {

          console.error('Theory Challenge Result Error:', error);

          this.errorMessage.set(
            error.error?.message ||
            'Unable to load Theory Challenge result.'
          );

          this.loading.set(false);

        }

      });
  }

  // GET EVALUATION CRITERION
  getCriterion(key: string): EvaluationCriterion | null {

    const details = this.result()?.evaluation_details;

    if (!details) {
      return null;
    }

    let parsedDetails = details;

    if (typeof details === 'string') {
      try {
        parsedDetails = JSON.parse(details);
      } catch {
        return null;
      }
    }

    return parsedDetails[key] || null;
  }

  // GET SELECTED CRITERIA
  getSelectedCriteria() {

    return this.criteriaList.filter(item => {
      const criterion = this.getCriterion(item.key);
      return criterion?.selected === true;
    });

  }

  // GET STATUS LABEL
  getStatusLabel(status: string): string {

    switch (status) {
      case 'pending':
        return 'Waiting for Review';

      case 'reviewed':
        return 'Reviewed';

      case 'completed':
        return 'Challenge Completed';

      default:
        return 'Unknown';
    }

  }

  // FORMAT SUBMITTED ANSWER
  getSubmittedAnswer(): string {

    const content = this.result()?.submitted_content;

    if (content === null || content === undefined) {
      return 'No submitted answer available.';
    }

    if (typeof content === 'string') {
      return content;
    }

    try {
      return JSON.stringify(content, null, 2);
    } catch {
      return String(content);
    }

  }

}
