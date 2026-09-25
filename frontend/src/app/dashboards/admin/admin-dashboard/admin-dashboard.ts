// USE:
// Displays the main Admin Dashboard with its own sidebar and topbar.
// This page is the main workspace for monitoring EduTech administration.

import { Component, OnInit , ChangeDetectorRef } from '@angular/core';

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

  overview = {
    programs: 0,
    departments: 0,
    education_years: 0,
    subjects: 0
  };

  constructor(
    private adminOverviewService: AdminOverview,
      private cdr: ChangeDetectorRef

  ) {}

  ngOnInit() {
    this.loadOverview();
  }

loadOverview() {
  this.adminOverviewService.getOverview().subscribe({
    next: (response: any) => {


      this.overview = response.overview;

      this.cdr.detectChanges();
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