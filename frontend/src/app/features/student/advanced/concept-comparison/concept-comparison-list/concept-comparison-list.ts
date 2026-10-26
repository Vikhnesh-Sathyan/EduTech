
import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import {
  StudentConceptComparisonService,
  ConceptComparison
} from '../../../../../services/student/advanced/concept-comparison/student-concept-comparison.service';

@Component({
  selector: 'app-concept-comparison-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './concept-comparison-list.html',
  styleUrl: './concept-comparison-list.css'
})
export class ConceptComparisonList {
  loading = signal(true);
  errorMessage = signal('');
  comparisons = signal<ConceptComparison[]>([]);
  expandedSubject = signal<string | null>(null);

  comparisonGroups = computed(() => {
    const groups = new Map<string, ConceptComparison[]>();

    for (const comparison of this.comparisons()) {
      const subjectName = comparison.subjectName || 'Other Subjects';

      if (!groups.has(subjectName)) {
        groups.set(subjectName, []);
      }

      groups.get(subjectName)!.push(comparison);
    }

    return Array.from(groups.entries())
      .map(([subjectName, comparisons]) => ({
        subjectName,
        comparisons
      }))
      .sort((a, b) => a.subjectName.localeCompare(b.subjectName));
  });

  constructor(
    private comparisonService: StudentConceptComparisonService,
    private router: Router
  ) {
    this.loadComparisons();
  }

  loadComparisons(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.comparisonService.getAvailableComparisons().subscribe({
   next: (result) => {
  console.log('Comparisons API result:', result);
  this.comparisons.set(result || []);
  console.log('Comparison groups:', this.comparisonGroups());
  this.loading.set(false);
},
error: (error) => {
  console.error('Comparisons API error:', error);
  this.errorMessage.set(
    error.error?.message || 'Failed to load Concept Comparisons.'
  );
  this.loading.set(false);
}
    });
  }

  toggleSubject(subjectName: string): void {
    this.expandedSubject.update(current =>
      current === subjectName ? null : subjectName
    );
  }

  openComparison(comparison: ConceptComparison): void {
    this.router.navigate([
      '/advanced-learning/concept-comparisons',
      comparison.id
    ]);
  }

  goBack(): void {
    this.router.navigate(['/advanced-learning']);
  }
}
