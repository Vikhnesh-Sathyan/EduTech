import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import {
  StudentTheoryChallengeService
} from '../../../../../services/student/challenge-arena/theory/student-theory-challenge';

interface TheoryChallengeAttempt {
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
  subject_name: string;
  challenge_type_name: string;
  reviewer_name: string | null;
}

@Component({
  selector: 'app-theory-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './theory-history.html',
  styleUrl: './theory-history.css'
})
export class TheoryHistory implements OnInit {

  private theoryService = inject(StudentTheoryChallengeService);

  attempts = signal<TheoryChallengeAttempt[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  ngOnInit(): void {
    this.loadTheoryHistory();
  }

  // LOAD STUDENT THEORY CHALLENGE HISTORY
  loadTheoryHistory(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.theoryService.getTheoryChallengeHistory().subscribe({

      next: (response) => {

        this.attempts.set(response.attempts || []);
        this.loading.set(false);

      },

      error: (error) => {

        console.error('Theory Challenge History Error:', error);

        this.errorMessage.set(
          error.error?.message || 'Unable to load Theory Challenge history.'
        );

        this.loading.set(false);

      }

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
        return 'Completed';

      default:
        return 'Unknown';
    }

  }

}