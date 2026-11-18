
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { StudentCareerInterviewExperiencesService } from '../../../../../services/student/career-hub/student-career-interview-experiences.service';

@Component({
  selector: 'app-student-interview-experiences',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './interview-experiences.html',
  styleUrl: './interview-experiences.css'
})
export class InterviewExperiences implements OnInit {

  private fb = inject(FormBuilder);
  private interviewService = inject(StudentCareerInterviewExperiencesService);

  // Page data
  experiences = signal<any[]>([]);
  companies = signal<any[]>([]);
  roles = signal<any[]>([]);
  countries = signal<any[]>([]);

  // Page states
  loading = signal(false);
  formLoading = signal(false);
  submitting = signal(false);

  // Messages
  successMessage = signal('');
  errorMessage = signal('');

  // Selected experience details
  selectedExperience = signal<any | null>(null);

  // Interview experience form
  experienceForm = this.fb.group({
    company_id: ['', Validators.required],
    job_role_id: ['', Validators.required],
    country_id: ['', Validators.required],
    experience_level: ['fresher', Validators.required],
    questions_text: ['', [
      Validators.required,
      Validators.maxLength(10000)
    ]]
  });

  ngOnInit(): void {
    this.loadFormData();
    this.loadExperiences();
  }

  // ==========================================
  // LOAD FORM DATA
  // ==========================================

  loadFormData(): void {

    this.formLoading.set(true);

    this.interviewService.getFormData().subscribe({

      next: (response) => {

        this.companies.set(response.data.companies || []);
        this.roles.set(response.data.roles || []);
        this.countries.set(response.data.countries || []);

        this.formLoading.set(false);

      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message || 'Failed to load form data'
        );

        this.formLoading.set(false);

      }

    });

  }

  // ==========================================
  // LOAD INTERVIEW EXPERIENCES
  // ==========================================

  loadExperiences(): void {

    this.loading.set(true);

    this.interviewService.getInterviewExperiences().subscribe({

      next: (response) => {

        this.experiences.set(response.data || []);
        this.loading.set(false);

      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message || 'Failed to load interview experiences'
        );

        this.loading.set(false);

      }

    });

  }

  // ==========================================
  // SUBMIT INTERVIEW EXPERIENCE
  // ==========================================

  submitExperience(): void {

    if (this.experienceForm.invalid) {

      this.experienceForm.markAllAsTouched();
      return;

    }

    this.submitting.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const formValue = this.experienceForm.getRawValue();

    this.interviewService.submitInterviewExperience({

      company_id: Number(formValue.company_id),
      job_role_id: Number(formValue.job_role_id),
      country_id: Number(formValue.country_id),

      experience_level: formValue.experience_level as 'fresher' | 'experienced',

      questions_text: formValue.questions_text?.trim() || ''

    }).subscribe({

      next: (response) => {

        this.successMessage.set(
          response.message || 'Interview experience published successfully'
        );

        this.experienceForm.reset({
          company_id: '',
          job_role_id: '',
          country_id: '',
          experience_level: 'fresher',
          questions_text: ''
        });

        this.submitting.set(false);

        this.loadExperiences();

      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message || 'Failed to submit interview experience'
        );

        this.submitting.set(false);

      }

    });

  }

  // ==========================================
  // VIEW EXPERIENCE DETAILS
  // ==========================================

  viewExperience(experience: any): void {
    this.selectedExperience.set(experience);
  }

  closeExperienceDetails(): void {
    this.selectedExperience.set(null);
  }

}
