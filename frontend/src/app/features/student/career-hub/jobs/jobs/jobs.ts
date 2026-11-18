
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  StudentCareerJobsService,
  CareerJob,
  JobFormData,
  SubmitCareerJob
} from '../../../../../services/student/career-hub/student-career-jobs.service';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe
  ],
  templateUrl: './jobs.html',
  styleUrl: './jobs.css'
})
export class Jobs implements OnInit {

  private fb = inject(FormBuilder);
  private jobService = inject(StudentCareerJobsService);

  // ==========================================
  // STATE
  // ==========================================

  jobs = signal<CareerJob[]>([]);
  formData = signal<JobFormData | null>(null);

  loading = signal(false);
  formLoading = signal(false);

  showForm = signal(false);

  activeTab = signal<'available' | 'submissions'>('available');

  errorMessage = signal('');
  successMessage = signal('');

  // ==========================================
  // JOB FORM
  // ==========================================

  jobForm: FormGroup = this.fb.group({
  company_id: [''],
  company_name: ['', Validators.maxLength(150)],
  job_role_id: ['', Validators.required],
  country_id: ['', Validators.required],
  state: [''],
  city: [''],
  experience_level: ['fresher', Validators.required],
  job_link: [
    '',
    [
      Validators.required,
      Validators.maxLength(1000),
      Validators.pattern(/^https?:\/\/.+/i)
    ]
  ]
});

  // ==========================================
  // LIFECYCLE
  // ==========================================

  ngOnInit(): void {
    this.loadFormData();
    this.loadJobs();
  }

  // ==========================================
  // LOAD JOB FORM DATA
  // ==========================================

  loadFormData(): void {

    this.jobService.getJobFormData().subscribe({

      next: (response) => {
        this.formData.set(response.data);
      },

      error: (error) => {
        this.errorMessage.set(
          error.error?.message || 'Failed to load job form data'
        );
      }

    });

  }

  // ==========================================
  // LOAD JOBS
  // ==========================================

  loadJobs(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.jobService.getJobs().subscribe({

      next: (response) => {
        this.jobs.set(response.data || []);
        this.loading.set(false);
      },

      error: (error) => {
        this.errorMessage.set(
          error.error?.message || 'Failed to load jobs'
        );
        this.loading.set(false);
      }

    });

  }

  // ==========================================
  // FILTERED JOB LISTS
  // ==========================================

  availableJobs(): CareerJob[] {
    return this.jobs().filter(
      job => job.status === 'published'
    );
  }

  mySubmissions(): CareerJob[] {
    return this.jobs().filter(
      job => job.status !== 'published'
    );
  }

  // ==========================================
  // CHANGE TAB
  // ==========================================

  changeTab(tab: 'available' | 'submissions'): void {
    this.activeTab.set(tab);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  // ==========================================
  // OPEN JOB FORM
  // ==========================================

  openForm(): void {

    this.jobForm.reset({
      company_id: '',
      job_role_id: '',
      country_id: '',
      state: '',
      city: '',
      experience_level: 'fresher',
      job_link: ''
    });

    this.errorMessage.set('');
    this.successMessage.set('');

    this.showForm.set(true);

  }

  // ==========================================
  // CLOSE JOB FORM
  // ==========================================

  closeForm(): void {
    this.showForm.set(false);
  }

  // ==========================================
  // SUBMIT JOB
  // ==========================================

submitJob() {

  if (this.jobForm.invalid) {
    this.jobForm.markAllAsTouched();
    return;
  }

  const v = this.jobForm.getRawValue();

  const selectedCompanyId = v.company_id
    ? Number(v.company_id)
    : null;

  const enteredCompanyName = v.company_name?.trim() || '';

  if (this.checkDuplicateCompany()) {
  this.errorMessage.set(
    'This company already exists. Please select it from the dropdown.'
  );
  return;
}

  // Exactly one company option is required
  if (
    (selectedCompanyId !== null && enteredCompanyName) ||
    (selectedCompanyId === null && !enteredCompanyName)
  ) {
    this.errorMessage.set(
      'Please select an existing company or enter a new company name.'
    );
    return;
  }

  const payload: SubmitCareerJob = {
    company_id: selectedCompanyId,
    company_name: selectedCompanyId ? null : enteredCompanyName,

    job_role_id: Number(v.job_role_id),
    country_id: Number(v.country_id),

    state: v.state?.trim() || undefined,
    city: v.city?.trim() || undefined,

    experience_level: v.experience_level,
    job_link: v.job_link.trim()
  };

  this.formLoading.set(true);
  this.errorMessage.set('');
  this.successMessage.set('');

  this.jobService.submitJob(payload).subscribe({

    next: response => {

      this.formLoading.set(false);
      this.showForm.set(false);

      this.successMessage.set(
        response.message || 'Job submitted successfully'
      );

      this.activeTab.set('submissions');

      this.loadJobs();
    },

    error: error => {

      this.formLoading.set(false);

      this.errorMessage.set(
        error.error?.message || 'Failed to submit job'
      );

    }

  });

}

  selectExistingCompany() {
  if (this.jobForm.get('company_id')?.value) {
    this.jobForm.patchValue({ company_name: '' });
  }
}

enterNewCompany() {
  if (this.jobForm.get('company_name')?.value?.trim()) {
    this.jobForm.patchValue({ company_id: '' });
  }
}

checkDuplicateCompany(): boolean {

  const enteredName = this.jobForm
    .get('company_name')
    ?.value?.trim();

  if (!enteredName) {
    return false;
  }

  const companies = this.formData()?.companies || [];

  return companies.some(company =>
    company.company_name.trim().toLowerCase() ===
    enteredName.toLowerCase()
  );
}

}
