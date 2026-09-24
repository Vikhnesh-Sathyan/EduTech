// Handles the student's profile page

import { Component, OnInit } from '@angular/core';

import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import { Profile as ProfileService } from '../../services/profile';

import { Education } from '../../services/education';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  message = '';
  errorMessage = '';

  // Education options loaded from the backend
  programs: any[] = [];
  departments: any[] = [];
  years: any[] = [];

  // Controls whether the profile can be edited
  editMode = false;

  // Stores the last saved profile values
  savedProfile: any = null;

  profileForm;

  constructor(
      // Tool to help build and manage the form fields easily

    private fb: FormBuilder,

      // Service used to talk to the server (get/save profile data)

    private profileService: ProfileService,

      // Both tools are now saved as this.fb and this.profileService,
      // so they can be used anywhere else in this class
      // private - means only this class can use it

    private educationService: Education


  ) {

    this.profileForm = this.fb.group({

      // Account information - read-only
      name: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],

      // Profile information - editable
      education_program_id: [null, Validators.required],
      department_id: [null, Validators.required],
      education_year_id: [null, Validators.required],
      career_goal: ['', Validators.required],
      learning_goals: ['', Validators.required]

    });

  }


  // Load the student's profile when the page opens
 ngOnInit() {
  this.loadEducationPrograms();
  this.loadProfile();
}

  // Load active education programs
loadEducationPrograms() {

  this.educationService.getPrograms().subscribe({

    next: (response: any) => {
      this.programs = response.programs;
    },

    error: (error) => {
      this.errorMessage =
        error.error?.message ||
        'Failed to load education programs.';
    }

  });

}

// Load departments when the student selects an education program
onProgramChange() {

  const programId =
    this.profileForm.controls.education_program_id.value;

  // Clear previous department and year selections
  this.profileForm.controls.department_id.setValue(null);
  this.profileForm.controls.education_year_id.setValue(null);

  this.departments = [];
  this.years = [];

  // Do nothing if no program is selected
  if (!programId) {
    return;
  }

  this.educationService.getDepartments(programId).subscribe({

    next: (response: any) => {
      this.departments = response.departments;
    },

    error: (error) => {
      this.errorMessage =
        error.error?.message ||
        'Failed to load departments.';
    }

  });
}

// Load education years when the student selects a department
onDepartmentChange() {

  const departmentId =
    this.profileForm.controls.department_id.value;

  // Clear the previous year selection
  this.profileForm.controls.education_year_id.setValue(null);

  this.years = [];

  // Do nothing if no department is selected
  if (!departmentId) {
    return;
  }

  this.educationService.getYears(departmentId).subscribe({

    next: (response: any) => {
      this.years = response.years;
    },

    error: (error) => {
      this.errorMessage =
        error.error?.message ||
        'Failed to load education years.';
    }

  });
}

  // Load the authenticated student's existing profile
// Load the authenticated student's existing profile
loadProfile() {

  this.profileService.getProfile().subscribe({

    next: (response: any) => {

      const profile = response.profile;

      this.savedProfile = {

        // Read-only account information
        name: profile.name || '',
        email: profile.email || '',

        // Education information
        education_program_id:
          profile.education_program_id || null,

        department_id:
          profile.department_id || null,

        education_year_id:
          profile.education_year_id || null,

        // Career information
        career_goal:
          profile.career_goal || '',

        learning_goals:
          profile.learning_goals || ''

      };

      // Load dependent education data
      this.loadProfileEducation();

    },

    error: (error) => {

      this.errorMessage =
        error.error?.message ||
        'Failed to load profile.';

    }

  });

}

// Load the education dropdowns using the saved profile IDs
loadProfileEducation() {

  const programId =
    this.savedProfile.education_program_id;

  const departmentId =
    this.savedProfile.department_id;

  // No program has been selected yet
  if (!programId) {

    this.profileForm.patchValue(
      this.savedProfile
    );

    this.profileForm.disable();

    return;
  }

  // Load departments for the saved program
  this.educationService
    .getDepartments(programId)
    .subscribe({

      next: (response: any) => {

        this.departments =
          response.departments;

        // Load years only after departments are available
        if (!departmentId) {

          this.profileForm.patchValue(
            this.savedProfile
          );

          this.profileForm.disable();

          return;
        }

        this.educationService
          .getYears(departmentId)
          .subscribe({

            next: (response: any) => {

              this.years =
                response.years;

              // Now all dropdown options exist
              this.profileForm.patchValue(
                this.savedProfile
              );

              // Profile starts in view mode
              this.profileForm.disable();

            },

            error: (error) => {

              this.errorMessage =
                error.error?.message ||
                'Failed to load education years.';

            }

          });

      },

      error: (error) => {

        this.errorMessage =
          error.error?.message ||
          'Failed to load departments.';

      }

    });

}

  // Enable only the editable profile fields
  // Enable the editable profile fields
editProfile() {

  this.message = '';
  this.errorMessage = '';

  this.editMode = true;

  this.profileForm.controls.education_program_id.enable();
  this.profileForm.controls.department_id.enable();
  this.profileForm.controls.education_year_id.enable();

  this.profileForm.controls.career_goal.enable();
  this.profileForm.controls.learning_goals.enable();
}


  // Cancel editing and restore the last saved values
  cancelEdit() {

    this.message = '';
    this.errorMessage = '';

    this.profileForm.patchValue(this.savedProfile);

    // Return to view mode
    this.profileForm.disable();

    this.editMode = false;

  }


  // Save the student's editable profile information
  onSubmit() {

    this.message = '';
    this.errorMessage = '';

    if (this.profileForm.invalid) {

      this.errorMessage =
        'Please complete all required profile details.';

      return;

    }

// Send the selected education IDs and career information
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

        // Keep the newly saved profile values
        this.savedProfile = {
          ...this.savedProfile,
          ...profileData
        };

        this.message = response.message;

        // Return to view mode
        this.profileForm.disable();

        this.editMode = false;

      },

      error: (error) => {

        this.errorMessage =
          error.error?.message || 'Failed to save profile.';

      }

    });

  }

}