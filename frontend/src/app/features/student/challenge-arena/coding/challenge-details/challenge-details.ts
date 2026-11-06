
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import {
    StudentCodingChallengeDetails as ChallengeDetailsData,
  StudentCodingChallengeService
} from '../../../../../services/student/challenge-arena/coding/student-coding-challenge';

import { parseSqlSchema, SqlSchemaTable } from './sql-schema-parser';

@Component({
  selector: 'app-student-coding-challenge-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './challenge-details.html',
  styleUrl: './challenge-details.css'
})
export class StudentCodingChallengeDetails implements OnInit {

  private route = inject(ActivatedRoute);
  private challengeService = inject(StudentCodingChallengeService);

  challenge = signal<ChallengeDetailsData | null>(null);

  schemaTables = signal<SqlSchemaTable[]>([]);

  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  ngOnInit(): void {
    const challengeId = Number(
      this.route.snapshot.paramMap.get('challengeId')
    );

    if (!challengeId || isNaN(challengeId)) {
      this.errorMessage.set('Invalid challenge ID.');
      this.loading.set(false);
      return;
    }

    this.loadChallenge(challengeId);
  }

  loadChallenge(challengeId: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.challengeService.getChallengeById(challengeId).subscribe({

    next: (response) => {
  const challengeData = response.challenge || null;

  this.challenge.set(challengeData);

  // Parse SQL schema dynamically
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
}
