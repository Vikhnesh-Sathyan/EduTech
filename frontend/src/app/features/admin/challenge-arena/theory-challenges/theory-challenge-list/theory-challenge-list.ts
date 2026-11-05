
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { TheoryChallengeService } from '../../../../../services/admin/challenge-arena/theory/theory-challenge';

@Component({
  selector: 'app-theory-challenge-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theory-challenge-list.html',
  styleUrl: './theory-challenge-list.css',
})
export class TheoryChallengeList implements OnInit {

  private router = inject(Router);
  private theoryChallengeService = inject(TheoryChallengeService);

  loading = signal(false);
  challenges = signal<any[]>([]);

  ngOnInit(): void {
    this.loadChallenges();
  }

  // LOAD THEORY CHALLENGES
  loadChallenges(): void {
    this.loading.set(true);

    this.theoryChallengeService.getTheoryChallenges().subscribe({
      next: (response: any) => {
        this.challenges.set(response.challenges || []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading theory challenges:', error);
        this.loading.set(false);
      }
    });
  }

  // NAVIGATE TO CREATE PAGE
  createChallenge(): void {
    this.router.navigate([
      '/admin/challenge-arena/theory-challenges/create'
    ]);
  }
}
