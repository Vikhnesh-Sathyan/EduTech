
import { Component, OnInit, signal } from '@angular/core';

import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import { Profile as ProfileService } from '../../../../services/student/profile';
import { Education } from '../../../../services/education';
import { StudentSubjects } from '../../../student/subjects/student-subjects/student-subjects';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    StudentSubjects
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  // UI messages
  message = signal('');
  errorMessage = signal('');

  // Education dropdown data
  programs = signal<any[]>([]);
  departments = signal<any[]>([]);
  years = signal<any[]>([]);

  // Profile editing state
  editMode = signal(false);

  // Last saved profile
  savedProfile = signal<any>(null);

  profileForm;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private educationService: Education,
    private toastService: ToastService
  ) {
    this.profileForm = this.fb.group({
      name: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],

      education_program_id: [null, Validators.required],
      department_id: [null, Validators.required],
      education_year_id: [null, Validators.required],

      career_goal: ['', Validators.required],
      learning_goals: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadEducationPrograms();
    this.loadProfile();
  }

  // Load education programs
  loadEducationPrograms() {
    this.educationService.getPrograms().subscribe({
      next: (response: any) => {
        this.programs.set(response.programs ?? []);
      },
      error: (error) => {
        const message =
          error.error?.message ||
          'Failed to load education programs.';

        this.errorMessage.set(message);
        this.toastService.error(message);
      }
    });
  }

  // Load departments when program changes
  onProgramChange() {
    const programId =
      this.profileForm.controls.education_program_id.value;

    this.profileForm.controls.department_id.setValue(null);
    this.profileForm.controls.education_year_id.setValue(null);

    this.departments.set([]);
    this.years.set([]);

    if (!programId) return;

    this.educationService.getDepartments(programId).subscribe({
      next: (response: any) => {
        this.departments.set(response.departments ?? []);
      },
      error: (error) => {
        const message =
          error.error?.message ||
          'Failed to load departments.';

        this.errorMessage.set(message);
        this.toastService.error(message);
      }
    });
  }

  // Load years when department changes
  onDepartmentChange() {
    const departmentId =
      this.profileForm.controls.department_id.value;

    this.profileForm.controls.education_year_id.setValue(null);
    this.years.set([]);

    if (!departmentId) return;

    this.educationService.getYears(departmentId).subscribe({
      next: (response: any) => {
        this.years.set(response.years ?? []);
      },
      error: (error) => {
        const message =
          error.error?.message ||
          'Failed to load education years.';

        this.errorMessage.set(message);
        this.toastService.error(message);
      }
    });
  }

  // Load profile information
  loadProfile() {
    this.profileService.getProfile().subscribe({
      next: (response: any) => {
        const profile = response.profile;

        const saved = {
          name: profile.name || '',
          email: profile.email || '',
          education_program_id: profile.education_program_id ?? null,
          department_id: profile.department_id ?? null,
          education_year_id: profile.education_year_id ?? null,
          career_goal: profile.career_goal || '',
          learning_goals: profile.learning_goals || ''
        };

        this.savedProfile.set(saved);

        // Display name and email immediately
        this.profileForm.patchValue({
          name: saved.name,
          email: saved.email
        });

        this.loadProfileEducation();
      },
      error: (error) => {
        const message =
          error.error?.message ||
          'Failed to load profile.';

        this.errorMessage.set(message);
        this.toastService.error(message);
      }
    });
  }

  // Load dropdown options before restoring saved selections
  loadProfileEducation() {
    const saved = this.savedProfile();

    if (!saved) return;

    const programId = saved.education_program_id;
    const departmentId = saved.department_id;

    if (!programId) {
      this.profileForm.patchValue(saved);
      this.profileForm.disable();
      return;
    }

    this.educationService.getDepartments(programId).subscribe({
      next: (response: any) => {
        this.departments.set(response.departments ?? []);

        if (!departmentId) {
          this.profileForm.patchValue(saved);
          this.profileForm.disable();
          return;
        }

        this.educationService.getYears(departmentId).subscribe({
          next: (response: any) => {
            this.years.set(response.years ?? []);

            this.profileForm.patchValue(saved);
            this.profileForm.disable();
          },
          error: (error) => {
            // Keep profile fields usable even if years fail to load
            this.profileForm.patchValue(saved);
            this.profileForm.disable();

            const message =
              error.error?.message ||
              'Failed to load education years.';

            this.errorMessage.set(message);
            this.toastService.error(message);
          }
        });
      },
      error: (error) => {
        // Keep profile fields usable even if departments fail to load
        this.profileForm.patchValue(saved);
        this.profileForm.disable();

        const message =
          error.error?.message ||
          'Failed to load departments.';

        this.errorMessage.set(message);
        this.toastService.error(message);
      }
    });
  }

  // Enable editable fields
  editProfile() {
    this.message.set('');
    this.errorMessage.set('');
    this.editMode.set(true);

    this.profileForm.controls.education_program_id.enable();
    this.profileForm.controls.department_id.enable();
    this.profileForm.controls.education_year_id.enable();
    this.profileForm.controls.career_goal.enable();
    this.profileForm.controls.learning_goals.enable();
  }

  // Restore saved values and exit edit mode
  cancelEdit() {
    this.message.set('');
    this.errorMessage.set('');

    const saved = this.savedProfile();

    if (saved) {
      this.profileForm.patchValue(saved);
    }

    this.profileForm.disable();
    this.editMode.set(false);
  }

  // Save profile changes
  onSubmit() {
    this.message.set('');
    this.errorMessage.set('');

    if (this.profileForm.invalid) {
      const message =
        'Please complete all required profile details.';

      this.errorMessage.set(message);
      this.toastService.error(message);
      return;
    }

    const profileData = {
      education_program_id:
        this.profileForm.controls.education_program_id.value!,
      department_id:
        this.profileForm.controls.department_id.value!,
      education_year_id:
        this.profileForm.controls.education_year_id.value!,
      career_goal:
        this.profileForm.controls.career_goal.value || '',
      learning_goals:
        this.profileForm.controls.learning_goals.value || ''
    };

    this.profileService.saveProfile(profileData).subscribe({
      next: (response: any) => {
        this.savedProfile.set({
          ...this.savedProfile(),
          ...profileData
        });

        const message =
          response.message || 'Profile saved successfully.';

        this.message.set(message);

        this.profileForm.disable();
        this.editMode.set(false);

        this.toastService.success(message);
      },
      error: (error) => {
        const message =
          error.error?.message ||
          'Failed to save profile.';

        this.errorMessage.set(message);
        this.toastService.error(message);
      }
    });
  }
}
