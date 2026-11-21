
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  MentorCareerReferralsService,
  ReferralFormData,
  CareerReferral
} from '../../../../../services/mentor/career-hub/mentor-career-referrals.service';

@Component({
  selector: 'app-mentor-career-referrals',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './referrals.html',
  styleUrl: './referrals.css'
})
export class Referrals implements OnInit {

  private fb = inject(FormBuilder);
  private referralService = inject(MentorCareerReferralsService);

  // ==========================================
  // STATE
  // ==========================================

  companies = signal<ReferralFormData['companies']>([]);
  jobRoles = signal<ReferralFormData['jobRoles']>([]);
  countries = signal<ReferralFormData['countries']>([]);

  referrals = signal<CareerReferral[]>([]);

  loading = signal(false);
  formLoading = signal(false);
  submitting = signal(false);

  successMessage = signal('');
  errorMessage = signal('');

  selectedReferral = signal<CareerReferral | null>(null);

  // ==========================================
  // REFERRAL FORM
  // ==========================================

  referralForm = this.fb.group({

    company_id: ['', Validators.required],

    job_role_id: ['', Validators.required],

    country_id: ['', Validators.required],

    job_link: [
      '',
      [Validators.required, Validators.pattern(/^https?:\/\/.+/i)]
    ],

    referral_instructions: ['', Validators.required]

  });

  // ==========================================
  // INITIALIZE
  // ==========================================

  ngOnInit(): void {
    this.loadFormData();
    this.loadReferrals();
  }

  // ==========================================
  // LOAD REFERRAL FORM DATA
  // ==========================================

  loadFormData(): void {

    this.formLoading.set(true);

    this.referralService.getReferralFormData().subscribe({

      next: (response) => {

        if (response.success) {

          this.companies.set(response.companies || []);
          this.jobRoles.set(response.jobRoles || []);
          this.countries.set(response.countries || []);

        }

        this.formLoading.set(false);

      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message || 'Failed to load referral form data'
        );

        this.formLoading.set(false);

      }

    });

  }

  // ==========================================
  // LOAD CAREER REFERRALS
  // ==========================================

  loadReferrals(): void {

    this.loading.set(true);

    this.referralService.getCareerReferrals().subscribe({

      next: (response) => {

        if (response.success) {
          this.referrals.set(response.referrals || []);
        }

        this.loading.set(false);

      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message || 'Failed to load referral opportunities'
        );

        this.loading.set(false);

      }

    });

  }

  // ==========================================
  // SUBMIT CAREER REFERRAL
  // ==========================================

  submitReferral(): void {

    this.successMessage.set('');
    this.errorMessage.set('');

    if (this.referralForm.invalid) {
      this.referralForm.markAllAsTouched();
      return;
    }

    const formValue = this.referralForm.getRawValue();

    const jobLink = formValue.job_link?.trim() || '';

    const instructions =
      formValue.referral_instructions?.trim() || '';

    if (!instructions) {
      this.errorMessage.set('Please enter referral instructions.');
      return;
    }

    try {

      const parsedUrl = new URL(jobLink);

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        this.errorMessage.set('Only HTTP and HTTPS job links are allowed.');
        return;
      }

    } catch {

      this.errorMessage.set('Please enter a valid job link.');
      return;

    }

    this.submitting.set(true);

    this.referralService.submitCareerReferral({

      company_id: Number(formValue.company_id),

      job_role_id: Number(formValue.job_role_id),

      country_id: Number(formValue.country_id),

      job_link: jobLink,

      referral_instructions: instructions

    }).subscribe({

      next: (response) => {

        this.submitting.set(false);

        if (response.success) {

          this.successMessage.set(
            response.message || 'Referral opportunity shared successfully'
          );

          this.referralForm.reset({
            company_id: '',
            job_role_id: '',
            country_id: '',
            job_link: '',
            referral_instructions: ''
          });

          this.loadReferrals();

        } else {

          this.errorMessage.set(
            response.message || 'Failed to share referral opportunity'
          );

        }

      },

      error: (error) => {

        this.submitting.set(false);

        this.errorMessage.set(
          error.error?.message || 'Failed to share referral opportunity'
        );

      }

    });

  }

  // ==========================================
  // VIEW REFERRAL DETAILS
  // ==========================================

  viewReferral(referral: CareerReferral): void {
    this.selectedReferral.set(referral);
  }

  // ==========================================
  // CLOSE REFERRAL DETAILS
  // ==========================================

  closeReferralDetails(): void {
    this.selectedReferral.set(null);
  }

}
