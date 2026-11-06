
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  StudentTheoryChallenge,
  StudentTheoryChallengeService
} from '../../../../../services/student/challenge-arena/theory/student-theory-challenge';

interface TheoryChallengeDetails extends StudentTheoryChallenge {
  challenge_content: {
    question?: string;
    technical_statement?: string;
    given_explanation?: string;
    [key: string]: any;
  };
}

@Component({
  selector: 'app-theory-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theory-details.html',
  styleUrl: './theory-details.css',
})
export class TheoryDetails implements OnInit {

  private theoryService = inject(StudentTheoryChallengeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  challenge = signal<TheoryChallengeDetails | null>(null);

  loading = signal<boolean>(true);
  submitting = signal<boolean>(false);

  answer = signal<string>('');

  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  ngOnInit(): void {
    this.loadChallengeDetails();
  }

  // LOAD THEORY CHALLENGE DETAILS
  loadChallengeDetails(): void {

    const challengeId = Number(
      this.route.snapshot.paramMap.get('challengeId')
    );

    if (!challengeId || isNaN(challengeId)) {
      this.errorMessage.set('Invalid Theory Challenge.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.theoryService.getTheoryChallengeById(challengeId).subscribe({
      next: (response) => {
        this.challenge.set(response.challenge);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Theory Challenge Details Error:', error);

        this.errorMessage.set(
          error.error?.message || 'Unable to load Theory Challenge.'
        );

        this.loading.set(false);
      }
    });
  }

  // UPDATE STUDENT ANSWER
  onAnswerChange(value: string): void {
    this.answer.set(value);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  // SUBMIT THEORY CHALLENGE ANSWER
  submitAnswer(): void {

    const item = this.challenge();

    if (!item) {
      return;
    }

    const studentAnswer = this.answer().trim();

    if (!studentAnswer) {
      this.errorMessage.set('Please write your answer before submitting.');
      return;
    }

    if (this.submitting()) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const payload = {
      submitted_content: {
        answer: studentAnswer
      }
    };

    this.theoryService
      .submitTheoryChallenge(item.id, payload)
      .subscribe({
        next: (response) => {

          this.successMessage.set(
            response.message || 'Answer submitted successfully. Waiting for review.'
          );

          this.answer.set('');
          this.submitting.set(false);
        },
        error: (error) => {

          console.error('Theory Challenge Submission Error:', error);

          this.errorMessage.set(
            error.error?.message || 'Unable to submit your answer.'
          );

          this.submitting.set(false);
        }
      });
  }

  // GO BACK TO THEORY LIST
  goBack(): void {
    this.router.navigate(['/student/challenge-arena/theory']);
  }
}
