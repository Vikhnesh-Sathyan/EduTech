
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import {
  StudentTheoryChallenge,
  StudentTheoryChallengeService
} from '../../../../../services/student/challenge-arena/theory/student-theory-challenge';

@Component({
  selector: 'app-theory-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './theory-list.html',
  styleUrl: './theory-list.css',
})
export class TheoryList implements OnInit {

  private theoryService = inject(StudentTheoryChallengeService);

  challenges = signal<StudentTheoryChallenge[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  ngOnInit(): void {
    this.loadTheoryChallenges();
  }

  // ==========================================
  // LOAD THEORY CHALLENGES
  // ==========================================

  loadTheoryChallenges(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.theoryService.getTheoryChallenges().subscribe({

      next: (response) => {

        this.challenges.set(response.challenges || []);
        this.loading.set(false);

      },

      error: (error) => {

        console.error('Failed to load Theory Challenges:', error);

        this.errorMessage.set(
          error.error?.message || 'Unable to load Theory Challenges.'
        );

        this.loading.set(false);

      }

    });

  }

}
