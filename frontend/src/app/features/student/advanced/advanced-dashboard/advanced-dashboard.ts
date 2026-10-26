import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import {
  StudentAdvancedService,
  StudentAdvancedSubjectGroup,
  StudentAdvancedSubjectSection
} from '../../../../services/student/advanced/student-advanced.service';

import {
  StudentConceptComparisonService,
  ConceptComparison
} from '../../../../services/student/advanced/concept-comparison/student-concept-comparison.service';

import { AdvancedPageHeader } from '../../../../features/student/advanced/advanced-page-header/advanced-page-header';
import { AdvancedSubjectGrid } from '../../../../features/student/advanced/advanced-subject-grid/advanced-subject-grid';

@Component({
  selector: 'app-advanced-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AdvancedPageHeader,
    AdvancedSubjectGrid
  ],
  templateUrl: './advanced-dashboard.html',
  styleUrl: './advanced-dashboard.css'
})
export class AdvancedDashboard implements OnInit {
  loading = signal(true);
  errorMessage = signal('');

  subjects = signal<StudentAdvancedSubjectGroup[]>([]);
  expandedSubjectId = signal<number | null>(null);

  comparisonsLoading = signal(true);
  comparisonsError = signal('');
  comparisons = signal<ConceptComparison[]>([]);

  constructor(
    private advancedService: StudentAdvancedService,
    private comparisonService: StudentConceptComparisonService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSubjects();
    this.loadComparisons();
  }

  loadSubjects(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.advancedService.getAdvancedSubjects().subscribe({
      next: (response) => {
        this.subjects.set(response.subjects || []);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.message ||
          'Failed to load Advanced Learning subjects.'
        );
        this.loading.set(false);
      }
    });
  }

  loadComparisons(): void {
    this.comparisonsLoading.set(true);
    this.comparisonsError.set('');

    this.comparisonService.getAvailableComparisons().subscribe({
      next: (response) => {
        this.comparisons.set(response || []);
        this.comparisonsLoading.set(false);
      },
      error: (error) => {
        this.comparisonsError.set(
          error.error?.message ||
          'Failed to load Concept Comparisons.'
        );
        this.comparisonsLoading.set(false);
      }
    });
  }

  toggleSubject(subjectId: number): void {
    this.expandedSubjectId.update((current) =>
      current === subjectId ? null : subjectId
    );
  }

  openSection(section: StudentAdvancedSubjectSection): void {
    if (!section.advancedUnlocked) {
      return;
    }

    this.router.navigate([
      '/advanced-learning',
      section.sectionId
    ]);
  }

  openComparison(comparison: ConceptComparison): void {
    this.router.navigate([
      '/advanced-learning/concept-comparisons',
      comparison.id
    ]);
  }





openConceptComparisons(): void {
  this.router.navigate(['/advanced-learning/concept-comparisons']);
}
}