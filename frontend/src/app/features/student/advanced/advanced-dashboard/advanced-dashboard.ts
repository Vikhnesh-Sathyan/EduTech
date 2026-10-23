import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  StudentAdvancedService,
  StudentAdvancedSubjectGroup,
  StudentAdvancedSubjectSection
} from '../../../../services/student/advanced/student-advanced.service';

import { AdvancedPageHeader } from '../../../../features/student/advanced/advanced-page-header/advanced-page-header';
import { AdvancedSubjectGrid } from '../../../../features/student/advanced/advanced-subject-grid/advanced-subject-grid';

@Component({
  selector: 'app-advanced-dashboard',
  standalone: true,
  imports: [
    CommonModule,
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

  constructor(
    private advancedService: StudentAdvancedService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.advancedService.getAdvancedSubjects().subscribe({
      next: response => {
        this.subjects.set(response.subjects || []);
        this.loading.set(false);
      },
      error: error => {
        this.errorMessage.set(
          error.error?.message ||
          'Failed to load Advanced Learning subjects.'
        );
        this.loading.set(false);
      }
    });
  }

  toggleSubject(subjectId: number): void {
    this.expandedSubjectId.update(current =>
      current === subjectId ? null : subjectId
    );
  }

  openSection(section: StudentAdvancedSubjectSection): void {
    if (!section.advancedUnlocked) return;

    this.router.navigate([
      '/advanced-learning',
      section.sectionId
    ]);
  }
}