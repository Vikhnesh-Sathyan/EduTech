// USE:
// Displays the main Admin Dashboard with its own sidebar and topbar.
// This page is the main workspace for monitoring EduTech administration.

import { Component, OnInit, signal } from '@angular/core';

import { Sidebar } from '../components/sidebar/sidebar';
import { Topbar } from '../components/topbar/topbar';

import { AdminOverview } from '../../../services/admin-overview';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    Sidebar,
    Topbar
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {

  // Signal holding the overview counts — auto-updates the UI when changed
  overview = signal({
    programs: 0,
    departments: 0,
    education_years: 0,
    subjects: 0
  });

  constructor(
    private adminOverviewService: AdminOverview
  ) {}

  ngOnInit() {
    this.loadOverview();
  }

  // Load the real education configuration counts for the dashboard
  loadOverview() {

    this.adminOverviewService.getOverview().subscribe({

      next: (response: any) => {
        this.overview.set(response.overview);
      },

      error: (error) => {
        console.error(
          'Failed to load admin overview:',
          error
        );
      }

    });
  }
}