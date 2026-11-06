
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  StudentCodingChallengeDetails as ChallengeDetailsData,
  StudentCodingChallengeService
} from '../../../../../services/student/challenge-arena/coding/student-coding-challenge';

import { parseSqlSchema, SqlSchemaTable } from './sql-schema-parser';
import { SqlQueryWorkspace } from '../sql-workspace/sql-query-workspace/sql-query-workspace';

@Component({
  selector: 'app-student-coding-challenge-details',
  standalone: true,
  imports: [CommonModule, SqlQueryWorkspace],
  templateUrl: './challenge-details.html',
  styleUrl: './challenge-details.css'
})
export class StudentCodingChallengeDetails implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private challengeService = inject(StudentCodingChallengeService);

  challenge = signal<ChallengeDetailsData | null>(null);
  schemaTables = signal<SqlSchemaTable[]>([]);

  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  // Student answers
  predictedOutput = signal<string>('');
  correctedCode = signal<string>('');
  explanation = signal<string>('');
  sqlQuery = signal<string>('');

  // Submission state
  submitting = signal<boolean>(false);
  successMessage = signal<string>('');

  private challengeId = 0;

  ngOnInit(): void {
    const challengeId = Number(
      this.route.snapshot.paramMap.get('challengeId')
    );

    if (!challengeId || isNaN(challengeId)) {
      this.errorMessage.set('Invalid challenge ID.');
      this.loading.set(false);
      return;
    }

    this.challengeId = challengeId;
    this.loadChallenge(challengeId);
  }

  loadChallenge(challengeId: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.challengeService.getChallengeById(challengeId).subscribe({

      next: (response) => {
        const challengeData = response.challenge || null;

        this.challenge.set(challengeData);

        if (
          challengeData?.challenge_type_key === 'sql_query_challenge' &&
          challengeData?.challenge_content?.database_schema
        ) {
          const tables = parseSqlSchema(
            challengeData.challenge_content.database_schema
          );

          this.schemaTables.set(tables);
        } else {
          this.schemaTables.set([]);
        }

        this.loading.set(false);

        if (!challengeData) {
          this.errorMessage.set('Challenge details not found.');
        }
      },

      error: (error) => {
        console.error('Failed to load challenge:', error);

        this.errorMessage.set(
          error.error?.message || 'Unable to load challenge details.'
        );

        this.loading.set(false);
      }

    });
  }

  // Receive SQL query from workspace
  onSqlQueryChange(query: string): void {
    this.sqlQuery.set(query);
  }

  // Submit student answer
  submitChallenge(): void {

    const currentChallenge = this.challenge();

    if (!currentChallenge || this.submitting()) {
      return;
    }

    let submittedContent: Record<string, unknown> = {};

    switch (currentChallenge.challenge_type_key) {

      case 'predict_output':
        if (!this.predictedOutput().trim()) {
          this.errorMessage.set('Please enter your predicted output.');
          return;
        }

        submittedContent = {
          predicted_output: this.predictedOutput().trim()
        };
        break;

      case 'bug_finder':
        if (!this.correctedCode().trim()) {
          this.errorMessage.set('Please enter your corrected code.');
          return;
        }

        if (!this.explanation().trim()) {
          this.errorMessage.set('Please explain your correction.');
          return;
        }

        submittedContent = {
          corrected_code: this.correctedCode().trim(),
          explanation: this.explanation().trim()
        };
        break;

      case 'sql_query_challenge':
        if (!this.sqlQuery().trim()) {
          this.errorMessage.set('Please write your SQL query.');
          return;
        }

        submittedContent = {
          sql_query: this.sqlQuery().trim()
        };
        break;

      default:
        this.errorMessage.set('Unsupported challenge type.');
        return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.submitting.set(true);

    this.challengeService.submitChallenge(
      this.challengeId,
      submittedContent
    ).subscribe({

      next: (response) => {
        this.submitting.set(false);

        this.router.navigate([
          '/student/challenge-arena/coding/result',
          response.attemptId
        ]);
      },

      error: (error) => {
        this.submitting.set(false);
        this.errorMessage.set(
          error.error?.message || 'Unable to submit your answer.'
        );
      }

    });
  }
}
