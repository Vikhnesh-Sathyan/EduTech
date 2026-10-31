
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import {
  LogicToCodeService,
  LogicToCodeStatistics,
  LogicToCodeRecentSubmission
} from '../../../../../../services/mentor/advanced/logic-to-code/logic-to-code.service';

@Component({
  selector: 'app-logic-to-code-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './logic-to-code-dashboard.html',
  styleUrl: './logic-to-code-dashboard.css'
})
export class LogicToCodeDashboard implements OnInit {

  private logicToCodeService = inject(LogicToCodeService);
  private router = inject(Router);

  // DASHBOARD DATA
  statistics = signal<LogicToCodeStatistics | null>(null);

  recentSubmissions = signal<LogicToCodeRecentSubmission[]>([]);

  // LOADING AND ERROR STATES
  loading = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    this.loadDashboard();
  }

  // LOAD DASHBOARD DATA
  loadDashboard(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.logicToCodeService.getDashboard().subscribe({

      next: (response) => {

        this.statistics.set(response.statistics ?? null);

        this.recentSubmissions.set(
          response.recentSubmissions ?? []
        );

        this.loading.set(false);
      },

      error: (error) => {

        console.error(
          'Failed to load Logic to Code dashboard:',
          error
        );

        this.errorMessage.set(
          error.error?.message ||
          'Unable to load dashboard. Please try again.'
        );

        this.loading.set(false);
      }

    });
  }

  // NAVIGATION METHODS

  openProblems(): void {
    this.router.navigate([
      '/mentor/advanced/logic-to-code/problems'
    ]);
  }

  createProblem(): void {
    this.router.navigate([
      '/mentor/advanced/logic-to-code/problems/create'
    ]);
  }

  openSubmissions(): void {
    this.router.navigate([
      '/mentor/advanced/logic-to-code/submissions'
    ]);
  }

  openDiscussions(): void {
    this.router.navigate([
      '/mentor/advanced/logic-to-code/discussions'
    ]);
  }

  openReports(): void {
    this.router.navigate([
      '/mentor/advanced/logic-to-code/reports'
    ]);
  }

  viewProblem(problemId: number): void {
    this.router.navigate([
      '/mentor/advanced/logic-to-code/problems',
      problemId
    ]);
  }

}
