
import { Component, OnInit, signal } from '@angular/core';

import { AdminCareerJobs } from '../../../../../services/admin/career-hub/admin-career-jobs';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [],
  templateUrl: './jobs.html',
  styleUrl: './jobs.css'
})
export class Jobs implements OnInit {

  // ==========================================
  // PAGE STATE
  // ==========================================

  jobs = signal<any[]>([]);

  loading = signal(false);

  message = '';
  errorMessage = '';

  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private careerJobsService: AdminCareerJobs
  ) {}

  // ==========================================
  // INITIALIZE PAGE
  // ==========================================

  ngOnInit() {
    this.loadJobs();
  }

  // ==========================================
  // LOAD ALL CAREER JOBS
  // ==========================================

  loadJobs() {

    this.loading.set(true);

    this.errorMessage = '';

    this.careerJobsService.getCareerJobs().subscribe({

      next: (response: any) => {

        this.jobs.set(response.data || []);

        this.loading.set(false);

      },

      error: (error) => {

        this.errorMessage =
          error.error?.message ||
          'Failed to load career jobs.';

        this.loading.set(false);

      }

    });

  }

  // ==========================================
  // APPROVE JOB
  // ==========================================

  approveJob(jobId: number) {

    this.message = '';
    this.errorMessage = '';

    this.careerJobsService.approveCareerJob(jobId).subscribe({

      next: (response: any) => {

        this.message = response.message;

        this.loadJobs();

      },

      error: (error) => {

        this.errorMessage =
          error.error?.message ||
          'Failed to approve job.';

      }

    });

  }

  // ==========================================
  // REJECT JOB
  // ==========================================

  rejectJob(jobId: number) {

    this.message = '';
    this.errorMessage = '';

    this.careerJobsService.rejectCareerJob(jobId).subscribe({

      next: (response: any) => {

        this.message = response.message;

        this.loadJobs();

      },

      error: (error) => {

        this.errorMessage =
          error.error?.message ||
          'Failed to reject job.';

      }

    });

  }

  // ==========================================
  // ARCHIVE JOB
  // ==========================================

  archiveJob(jobId: number) {

    this.message = '';
    this.errorMessage = '';

    this.careerJobsService.archiveCareerJob(jobId).subscribe({

      next: (response: any) => {

        this.message = response.message;

        this.loadJobs();

      },

      error: (error) => {

        this.errorMessage =
          error.error?.message ||
          'Failed to archive job.';

      }

    });

  }

}
