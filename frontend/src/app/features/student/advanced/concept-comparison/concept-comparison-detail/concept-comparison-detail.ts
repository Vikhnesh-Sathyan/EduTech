
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import {
  StudentConceptComparisonService,
  ConceptComparison
} from '../../../../../services/student/advanced/concept-comparison/student-concept-comparison.service';

@Component({
  selector: 'app-concept-comparison-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './concept-comparison-detail.html',
  styleUrl: './concept-comparison-detail.css'
})
export class ConceptComparisonDetails implements OnInit {
  loading = signal(true);
  errorMessage = signal('');
  comparison = signal<ConceptComparison | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private comparisonService: StudentConceptComparisonService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (
      idParam === null ||
      idParam.trim() === '' ||
      !Number.isSafeInteger(id) ||
      id <= 0
    ) {
      this.errorMessage.set('Invalid comparison selected.');
      this.loading.set(false);
      return;
    }

    this.loadComparison(id);
  }

  private loadComparison(id: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.comparisonService.getAvailableComparisons().subscribe({
      next: (comparisons: ConceptComparison[]) => {
        const selected = comparisons.find(
          (item: ConceptComparison) => item.id === id
        );

        if (selected === undefined) {
          this.errorMessage.set(
            'This comparison is unavailable or does not match your academic profile.'
          );
          this.comparison.set(null);
        } else {
          this.comparison.set(selected);
        }

        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load comparison details:', error);

        this.errorMessage.set(
          'Failed to load comparison details. Please try again.'
        );
        this.loading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/advanced-learning']);
  }
}
