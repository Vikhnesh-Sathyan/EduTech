
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import {
  LogicToCodeSubmissionsService,
  LogicToCodeSubmission
} from '../../../../../../services/mentor/advanced/logic-to-code/logic-to-code-submissions.service';

@Component({
  selector: 'app-submission-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './submission-list.html',
  styleUrl: './submission-list.css'
})
export class SubmissionList implements OnInit {

  private submissionService = inject(LogicToCodeSubmissionsService);
  private router = inject(Router);

  // =====================================================
  // COMPONENT STATE
  // =====================================================

  submissions = signal<LogicToCodeSubmission[]>([]);

  loading = signal(false);
  errorMessage = signal('');

  currentPage = signal(1);
  limit = signal(10);
  totalPages = signal(0);
  totalSubmissions = signal(0);

  search = signal('');
  selectedStatus = signal('');
  selectedLanguage = signal('');

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  ngOnInit(): void {
    this.loadSubmissions();
  }

  // =====================================================
  // LOAD SUBMISSIONS
  // =====================================================

  loadSubmissions(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.submissionService.getSubmissions(
      this.currentPage(),
      this.limit(),
      this.selectedStatus(),
      this.selectedLanguage(),
      this.search()
    ).subscribe({

      next: (response) => {

        this.submissions.set(response.submissions);

        this.currentPage.set(response.pagination.currentPage);
        this.totalPages.set(response.pagination.totalPages);
        this.totalSubmissions.set(response.pagination.totalSubmissions);

        this.loading.set(false);
      },

      error: (error) => {

        console.error('Error loading submissions:', error);

        this.errorMessage.set(
          error.error?.message || 'Unable to load submissions.'
        );

        this.loading.set(false);
      }

    });
  }

  // =====================================================
  // SEARCH
  // =====================================================

  onSearchChange(value: string): void {
    this.search.set(value);
    this.currentPage.set(1);
    this.loadSubmissions();
  }

  // =====================================================
  // FILTER BY STATUS
  // =====================================================

  onStatusChange(value: string): void {
    this.selectedStatus.set(value);
    this.currentPage.set(1);
    this.loadSubmissions();
  }

  // =====================================================
  // FILTER BY LANGUAGE
  // =====================================================

  onLanguageChange(value: string): void {
    this.selectedLanguage.set(value);
    this.currentPage.set(1);
    this.loadSubmissions();
  }

  // =====================================================
  // PAGINATION
  // =====================================================

  previousPage(): void {

    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
      this.loadSubmissions();
    }
  }

  nextPage(): void {

    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
      this.loadSubmissions();
    }
  }

  // =====================================================
  // NAVIGATION
  // =====================================================

  goToDashboard(): void {
    this.router.navigate(['/mentor/advanced/logic-to-code/dashboard']);
  }

  viewSubmission(submissionId: number): void {
    this.router.navigate([
      '/mentor/advanced/logic-to-code/submissions',
      submissionId
    ]);
  }

}
