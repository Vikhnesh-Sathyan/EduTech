
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  StudentCodingChallenge,
  StudentCodingChallengeService
} from '../../../../../services/student/challenge-arena/coding/student-coding-challenge';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-student-coding-challenge-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './challenge-list.html',
  styleUrl: './challenge-list.css'
})
export class StudentCodingChallengeList implements OnInit {

  private challengeService = inject(StudentCodingChallengeService);

  challenges = signal<StudentCodingChallenge[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  ngOnInit(): void {
    this.loadChallenges();
  }

  loadChallenges(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.challengeService.getChallenges().subscribe({

      next: (response) => {

        this.challenges.set(response.challenges || []);

        this.loading.set(false);
      },

      error: (error) => {

        console.error('Failed to load coding challenges:', error);

        this.errorMessage.set(
          error.error?.message || 'Unable to load coding challenges.'
        );

        this.loading.set(false);
      }

    });
  }

}
