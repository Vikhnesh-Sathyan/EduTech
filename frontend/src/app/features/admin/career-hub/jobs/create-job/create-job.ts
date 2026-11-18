import { Component, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { RouterLink } from '@angular/router';

import { AdminCareerJobs } from '../../../../../services/admin/career-hub/admin-career-jobs';

@Component({
  selector: 'app-create-job',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './create-job.html',
  styleUrl: './create-job.css'
})
export class CreateJob implements OnInit {

  // ==========================================
  // DROPDOWN DATA
  // ==========================================

  companies = signal<any[]>([]);
  roles = signal<any[]>([]);
  countries = signal<any[]>([]);

  // ==========================================
  // PAGE STATE
  // ==========================================

  loading = signal(false);
  submitting = signal(false);

  message = '';
  errorMessage = '';

  // ==========================================
  // JOB FORM
  // ==========================================

  jobForm!: FormGroup;

  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private fb: FormBuilder,
    private careerJobsService: AdminCareerJobs
  ) {

    this.jobForm = this.fb.group({

      company_id: ['', Validators.required],

      job_role_id: ['', Validators.required],

      country_id: ['', Validators.required],

      state: [''],

      city: [''],

      experience_level: ['', Validators.required],

      job_link: [
        '',
        [
          Validators.required,
          Validators.pattern(/^https?:\/\/.+/i),
          Validators.maxLength(1000)
        ]
      ]

    });

  }

  // ==========================================
  // INITIALIZE COMPONENT
  // ==========================================

  ngOnInit(): void {
    this.loadFormData();
  }

  // ==========================================
  // LOAD DROPDOWN DATA
  // ==========================================

  loadFormData(): void {

    this.loading.set(true);
    this.errorMessage = '';

    this.careerJobsService.getJobFormData().subscribe({

      next: (response: any) => {

        this.companies.set(response.data?.companies || []);
        this.roles.set(response.data?.roles || []);
        this.countries.set(response.data?.countries || []);

        this.loading.set(false);

      },

      error: (error) => {

        this.errorMessage =
          error.error?.message ||
          'Failed to load job form data.';

        this.loading.set(false);

      }

    });

  }

  // ==========================================
  // CREATE AND PUBLISH JOB
  // ==========================================

  createJob(): void {

    this.message = '';
    this.errorMessage = '';

    if (this.jobForm.invalid) {

      this.jobForm.markAllAsTouched();

      return;

    }

    if (this.submitting()) {
      return;
    }

    this.submitting.set(true);

    const jobData = this.jobForm.getRawValue();

    this.careerJobsService.createCareerJob(jobData).subscribe({

      next: (response: any) => {

        this.message =
          response.message || 'Job published successfully.';

        this.jobForm.reset();

        this.submitting.set(false);

      },

      error: (error) => {

        this.errorMessage =
          error.error?.message ||
          'Failed to publish job.';

        this.submitting.set(false);

      }

    });

  }

}
