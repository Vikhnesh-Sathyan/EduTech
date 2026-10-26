import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  ConceptComparisonService,
  MentorComparison
} from '../../../../../services/mentor/advanced/concept-comparison/concept-comparison.service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-my-comparisons',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-comparisons.html',
  styleUrl: './my-comparisons.css'
})
export class MyComparisons implements OnInit {
  comparisons = signal<MentorComparison[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  constructor(
  private comparisonService: ConceptComparisonService,
  private router: Router
) {}

  ngOnInit(): void {
    this.loadComparisons();
  }

  loadComparisons(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.comparisonService.getMyComparisons().subscribe({
      next: response => {
        this.comparisons.set(response.comparisons ?? []);
        this.loading.set(false);
      },
      error: error => {
        console.error('Failed to load comparisons:', error);
        this.errorMessage.set(
          error.error?.message || 'Failed to load your comparisons.'
        );
        this.loading.set(false);
      }
    });
  }
viewComparison(id: number): void {
  this.router.navigate([
    '/mentor/advanced/my-comparisons',
    id
  ]);
}
}