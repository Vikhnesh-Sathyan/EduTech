
import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { RouterLink } from '@angular/router';

import { AdminCareerJobs } from '../../../../../services/admin/career-hub/admin-career-jobs';
import { ConfirmModalComponent } from '../../../../../shared/confirm-modal/confirm-modal';

type JobAction = 'approve' | 'reject' | 'archive';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [DatePipe, ConfirmModalComponent, RouterLink],
  templateUrl: './jobs.html',
  styleUrl: './jobs.css'
})
export class Jobs implements OnInit {

  // ==========================================
  // PAGE STATE
  // ==========================================

  jobs = signal<any[]>([]);
  loading = signal(false);

  searchTerm = signal('');
  selectedStatus = signal('all');

  message = '';
  errorMessage = '';

  // ==========================================
  // CONFIRMATION MODAL STATE
  // ==========================================

  modalVisible = false;

  modalTitle = '';
  modalMessage = '';
  modalConfirmText = 'Confirm';
  modalDanger = false;

  pendingAction: JobAction | null = null;
  pendingJobId: number | null = null;

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
  // OPEN CONFIRMATION MODAL
  // ==========================================

  openConfirmation(action: JobAction, jobId: number) {

    this.pendingAction = action;
    this.pendingJobId = jobId;

    const modalSettings = {

      approve: {
        title: 'Approve Job',
        message: 'Are you sure you want to approve this job opportunity?',
        confirmText: 'Approve',
        danger: false
      },

      reject: {
        title: 'Reject Job',
        message: 'Are you sure you want to reject this job submission?',
        confirmText: 'Reject',
        danger: true
      },

      archive: {
        title: 'Archive Job',
        message: 'Are you sure you want to archive this published job?',
        confirmText: 'Archive',
        danger: true
      }

    };

    const settings = modalSettings[action];

    this.modalTitle = settings.title;
    this.modalMessage = settings.message;
    this.modalConfirmText = settings.confirmText;
    this.modalDanger = settings.danger;

    this.modalVisible = true;

  }

  // ==========================================
  // CONFIRM SELECTED ACTION
  // ==========================================

  confirmAction() {

    if (this.pendingAction === null || this.pendingJobId === null) {
      return;
    }

    const action = this.pendingAction;
    const jobId = this.pendingJobId;

    this.closeModal();

    switch (action) {

      case 'approve':
        this.approveJob(jobId);
        break;

      case 'reject':
        this.rejectJob(jobId);
        break;

      case 'archive':
        this.archiveJob(jobId);
        break;

    }

  }

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  closeModal() {

    this.modalVisible = false;
    this.pendingAction = null;
    this.pendingJobId = null;

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

  // ==========================================
  // FILTER JOBS
  // ==========================================

  get filteredJobs() {

    const search = this.searchTerm().toLowerCase().trim();
    const status = this.selectedStatus();

    return this.jobs().filter(job => {

      const matchesSearch =
        job.company_name?.toLowerCase().includes(search) ||
        job.role_name?.toLowerCase().includes(search);

      const matchesStatus =
        status === 'all' || job.status === status;

      return matchesSearch && matchesStatus;

    });

  }

}
