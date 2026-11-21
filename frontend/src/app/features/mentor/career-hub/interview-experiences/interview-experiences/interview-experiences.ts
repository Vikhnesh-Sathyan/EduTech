
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  MentorCareerInterviewExperiencesService,
  InterviewFormData,
  InterviewExperience
} from '../../../../../services/mentor/career-hub/mentor-career-interview-experiences.service';

@Component({
  selector: 'app-mentor-interview-experiences',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './interview-experiences.html',
  styleUrl: './interview-experiences.css'
})
export class InterviewExperiences implements OnInit {

  private fb = inject(FormBuilder);

  private interviewService = inject(
    MentorCareerInterviewExperiencesService
  );

  // PAGE DATA

  experiences = signal<InterviewExperience[]>([]);

  companies = signal<InterviewFormData['companies']>([]);

  roles = signal<InterviewFormData['roles']>([]);

  countries = signal<InterviewFormData['countries']>([]);

  // PAGE STATES

  loading = signal(false);

  formLoading = signal(false);

  submitting = signal(false);

  // MESSAGES

  successMessage = signal('');

  errorMessage = signal('');

  // SELECTED EXPERIENCE

  selectedExperience = signal<InterviewExperience | null>(null);

  // INTERVIEW EXPERIENCE FORM

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

        if (response.success) {

          this.companies.set(response.data.companies || []);

          this.roles.set(response.data.roles || []);

          this.countries.set(response.data.countries || []);

        }

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

        if (response.success) {

          this.experiences.set(response.data || []);

        }

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

    this.successMessage.set('');

    this.errorMessage.set('');

    if (this.experienceForm.invalid) {

      this.experienceForm.markAllAsTouched();

      return;

    }

    const formValue = this.experienceForm.getRawValue();

    const questionsText = formValue.questions_text?.trim() || '';

    if (!questionsText) {

      this.errorMessage.set('Please enter your interview experience.');

      return;

    }

    this.submitting.set(true);

    this.interviewService.submitInterviewExperience({

      company_id: Number(formValue.company_id),

      job_role_id: Number(formValue.job_role_id),

      country_id: Number(formValue.country_id),

      experience_level: formValue.experience_level as 'fresher' | 'experienced',

      questions_text: questionsText

    }).subscribe({

      next: (response) => {

        this.submitting.set(false);

        if (response.success) {

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

          this.loadExperiences();

        } else {

          this.errorMessage.set(
            response.message || 'Failed to submit interview experience'
          );

        }

      },

      error: (error) => {

        this.submitting.set(false);

        this.errorMessage.set(
          error.error?.message || 'Failed to submit interview experience'
        );

      }

    });

  }

  // ==========================================
  // VIEW EXPERIENCE DETAILS
  // ==========================================

  viewExperience(experience: InterviewExperience): void {

    this.selectedExperience.set(experience);

  }

  // ==========================================
  // CLOSE EXPERIENCE DETAILS
  // ==========================================

  closeExperienceDetails(): void {

    this.selectedExperience.set(null);

  }

}
