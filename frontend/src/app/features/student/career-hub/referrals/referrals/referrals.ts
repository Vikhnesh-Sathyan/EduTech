
import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { StudentCareerReferralsService } from '../../../../../services/student/career-hub/student-career-referrals.service';

interface ReferralCompany {
  id: number;
  company_name: string;
}

interface ReferralJobRole {
  id: number;
  role_name: string;
}

interface ReferralCountry {
  id: number;
  country_name: string;
}

interface CareerReferral {
  id: number;
  company_id: number;
  company_name: string;
  job_role_id: number;
  role_name: string;
  country_id: number;
  country_name: string;
  job_link: string;
  referral_instructions: string;
  created_by: number;
  status: string;
  created_at: string;
  contributor_name: string;
}

@Component({
  selector: 'app-student-career-referrals',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe
  ],
  templateUrl: './referrals.html',
  styleUrl: './referrals.css'
})
export class Referrals implements OnInit {

  private fb = inject(FormBuilder);

  private referralsService =
    inject(StudentCareerReferralsService);

  // ==========================================
  // SIGNALS
  // ==========================================

  companies = signal<ReferralCompany[]>([]);

  jobRoles = signal<ReferralJobRole[]>([]);

  countries = signal<ReferralCountry[]>([]);

  referrals = signal<CareerReferral[]>([]);

  loading = signal(false);

  formLoading = signal(false);

  submitting = signal(false);

  successMessage = signal('');

  errorMessage = signal('');

  selectedReferral = signal<CareerReferral | null>(null);

  // ==========================================
  // FORM
  // ==========================================

  referralForm = this.fb.group({

    company_id: ['', Validators.required],

    job_role_id: ['', Validators.required],

    country_id: ['', Validators.required],

    job_link: [
      '',
      [
        Validators.required,
        Validators.maxLength(2048),
        Validators.pattern(/^https?:\/\/.+/i)
      ]
    ],

    referral_instructions: [
      '',
      [
        Validators.required,
        Validators.maxLength(10000)
      ]
    ]

  });

  // ==========================================
  // INITIALIZATION
  // ==========================================

  ngOnInit(): void {

    this.loadFormData();

    this.loadReferrals();

  }

  // ==========================================
  // LOAD FORM DATA
  // ==========================================

  loadFormData(): void {

    this.formLoading.set(true);

    this.referralsService.getReferralFormData()
      .subscribe({

        next: (response) => {

          this.companies.set(response.companies || []);

          this.jobRoles.set(response.jobRoles || []);

          this.countries.set(response.countries || []);

          this.formLoading.set(false);

        },

        error: (error) => {

          this.errorMessage.set(
            error.error?.message ||
            'Failed to load referral form data'
          );

          this.formLoading.set(false);

        }

      });

  }

  // ==========================================
  // LOAD REFERRALS
  // ==========================================

  loadReferrals(): void {

    this.loading.set(true);

    this.referralsService.getCareerReferrals()
      .subscribe({

        next: (response) => {

          this.referrals.set(response.referrals || []);

          this.loading.set(false);

        },

        error: (error) => {

          this.errorMessage.set(
            error.error?.message ||
            'Failed to load referral opportunities'
          );

          this.loading.set(false);

        }

      });

  }

  // ==========================================
  // SUBMIT REFERRAL
  // ==========================================

  submitReferral(): void {

    this.successMessage.set('');

    this.errorMessage.set('');

    if (this.referralForm.invalid) {

      this.referralForm.markAllAsTouched();

      return;

    }

    this.submitting.set(true);

    const formValue = this.referralForm.getRawValue();

    const payload = {

      company_id: Number(formValue.company_id),

      job_role_id: Number(formValue.job_role_id),

      country_id: Number(formValue.country_id),

      job_link: formValue.job_link!.trim(),

      referral_instructions:
        formValue.referral_instructions!.trim()

    };

    this.referralsService.submitCareerReferral(payload)
      .subscribe({

        next: (response) => {

          this.successMessage.set(
            response.message ||
            'Referral opportunity shared successfully'
          );

          this.referralForm.reset({

            company_id: '',

            job_role_id: '',

            country_id: '',

            job_link: '',

            referral_instructions: ''

          });

          this.loadReferrals();

          this.submitting.set(false);

        },

        error: (error) => {

          this.errorMessage.set(
            error.error?.message ||
            'Failed to share referral opportunity'
          );

          this.submitting.set(false);

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
