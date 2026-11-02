
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LogicToCodeService,
  StudentLogicToCodeStatistics,
  StudentDifficultyProgress,
  StudentRecentSubmission
} from '../../../../../services/student/advanced/logic-to-code/logic-to-code.service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-student-logic-to-code-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  private logicToCodeService = inject(LogicToCodeService);
  private router = inject(Router);
  // =====================================================
  // DASHBOARD STATE
  // =====================================================

  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  statistics = signal<StudentLogicToCodeStatistics | null>(null);

  difficultyProgress = signal<StudentDifficultyProgress[]>([]);

  recentSubmissions = signal<StudentRecentSubmission[]>([]);

  // =====================================================
  // COMPONENT INITIALIZATION
  // =====================================================

  ngOnInit(): void {
    this.loadDashboard();
  }

  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================

  loadDashboard(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.logicToCodeService.getDashboard().subscribe({

      next: (response) => {

        if (response.success && response.data) {

          this.statistics.set(response.data.statistics);

          this.difficultyProgress.set(
            response.data.difficultyProgress || []
          );

          this.recentSubmissions.set(
            response.data.recentSubmissions || []
          );

        } else {

          this.errorMessage.set(
            response.message || 'Unable to load dashboard.'
          );

        }

        this.loading.set(false);

      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message || 'Failed to load dashboard.'
        );

        this.loading.set(false);

      }

    });

  }

  // =====================================================
  // DIFFICULTY PROGRESS PERCENTAGE
  // =====================================================

  getProgressPercentage(progress: StudentDifficultyProgress): number {

    if (!progress.attempted) {
      return 0;
    }

    return Math.round(
      (progress.completed / progress.attempted) * 100
    );

  }

  // =====================================================
  // STATUS LABEL
  // =====================================================

  getStatusLabel(status: string): string {

    switch (status?.toLowerCase()) {

      case 'accepted':
        return 'Accepted';

      case 'rejected':
        return 'Rejected';

      case 'pending':
        return 'Pending';

      case 'error':
        return 'Error';

      default:
        return status || 'Not available';

    }

  }

  // =====================================================
  // FORMAT DATE
  // =====================================================

  formatDate(date: string): string {

    if (!date) {
      return '—';
    }

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

  }

  // =====================================================
// NAVIGATE TO PROBLEM LIST
// =====================================================

goToProblems(): void {
  this.router.navigate([
    '/student/advanced/logic-to-code/problems'
  ]);
}

}
