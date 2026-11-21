
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  MentorCareerJobsService,
  JobFormData,
  CareerJob
} from '../../../../../services/mentor/career-hub/mentor-career-jobs.service';

@Component({
  selector: 'app-mentor-career-jobs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './jobs.html',
  styleUrl: './jobs.css'
})
export class Jobs implements OnInit {

  private fb = inject(FormBuilder);
  private jobsService = inject(MentorCareerJobsService);

  formData = signal<JobFormData | null>(null);
  jobs = signal<CareerJob[]>([]);

  isLoading = signal(false);
  isSubmitting = signal(false);

  successMessage = signal('');
  errorMessage = signal('');

  showForm = signal(false);

  jobForm = this.fb.group({
    company_id: [null as number | null],
    company_name: [''],
    job_role_id: [null as number | null, Validators.required],
    country_id: [null as number | null, Validators.required],
    state: [''],
    city: [''],
    experience_level: ['fresher', Validators.required],
    job_link: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/i)]]
  });

  ngOnInit(): void {
    this.loadFormData();
    this.loadJobs();
  }

  loadFormData(): void {
    this.jobsService.getJobFormData().subscribe({
      next: (response) => {
        if (response.success) {
          this.formData.set(response.data);
        }
      },
      error: () => {
        this.errorMessage.set('Unable to load job form data.');
      }
    });
  }

  loadJobs(): void {
    this.isLoading.set(true);

    this.jobsService.getJobs().subscribe({
      next: (response) => {
        if (response.success) {
          this.jobs.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load jobs.');
        this.isLoading.set(false);
      }
    });
  }

  onCompanyChange(): void {
    this.jobForm.patchValue({ company_name: '' });
  }

  onCompanyNameChange(): void {
    this.jobForm.patchValue({ company_id: null });
  }

  openForm(): void {
    this.successMessage.set('');
    this.errorMessage.set('');
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.jobForm.reset({
      company_id: null,
      company_name: '',
      job_role_id: null,
      country_id: null,
      state: '',
      city: '',
      experience_level: 'fresher',
      job_link: ''
    });
  }

  submitJob(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (this.jobForm.invalid) {
      this.jobForm.markAllAsTouched();
      return;
    }

    const companyId = this.jobForm.value.company_id;
    const companyName = this.jobForm.value.company_name?.trim() || '';

    if ((!companyId && !companyName) || (companyId && companyName)) {
      this.errorMessage.set('Select an existing company or enter a new company name.');
      return;
    }

    this.isSubmitting.set(true);

    this.jobsService.submitJob({
      company_id: companyId || null,
      company_name: companyId ? null : companyName,
      job_role_id: Number(this.jobForm.value.job_role_id),
      country_id: Number(this.jobForm.value.country_id),
      state: this.jobForm.value.state || '',
      city: this.jobForm.value.city || '',
      experience_level: this.jobForm.value.experience_level as 'fresher' | 'experienced',
      job_link: this.jobForm.value.job_link || ''
    }).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);

        if (response.success) {
          this.successMessage.set('Job submitted successfully. It is waiting for admin approval.');
          this.closeForm();
          this.loadJobs();
        } else {
          this.errorMessage.set(response.message || 'Unable to submit job.');
        }
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          error.error?.message || 'Unable to submit job. Please try again.'
        );
      }
    });
  }
}
