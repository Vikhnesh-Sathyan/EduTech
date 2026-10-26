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
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage.set('Invalid comparison selected.');
      this.loading.set(false);
      return;
    }

    this.comparisonService.getAvailableComparisons().subscribe({
      next: (comparisons) => {
        const selected = comparisons.find(item => item.id === id);

        if (!selected) {
          this.errorMessage.set(
            'This comparison is unavailable or does not match your academic profile.'
          );
        } else {
          this.comparison.set(selected);
        }

        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.message ||
          'Failed to load comparison details.'
        );
        this.loading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/advanced-learning']);
  }
}