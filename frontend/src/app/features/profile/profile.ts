// Handles the student's profile page

import { Component, OnInit } from '@angular/core';

import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import { Profile as ProfileService } from '../../services/profile';

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

  // Controls whether the profile can be edited
  editMode = false;

  // Stores the last saved profile values
  savedProfile: any = null;

  profileForm;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService
  ) {

    this.profileForm = this.fb.group({

      // Account information - read-only
      name: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],

      // Profile information - editable
      highest_qualification: ['', Validators.required],
      department: ['', Validators.required],
      study_year: ['', Validators.required],
      career_goal: ['', Validators.required],
      learning_goals: ['', Validators.required]

    });

  }


  // Load the student's profile when the page opens
  ngOnInit() {
    this.loadProfile();
  }


  // Load the authenticated student's existing profile
  loadProfile() {

    this.profileService.getProfile().subscribe({

      next: (response: any) => {

        const profile = response.profile;

        this.savedProfile = {

          // Read-only account information
          name: profile.name || '',
          email: profile.email || '',

          // Editable profile information
          highest_qualification:
            profile.highest_qualification || '',

          department:
            profile.department || '',

          study_year:
            profile.study_year || '',

          career_goal:
            profile.career_goal || '',

          learning_goals:
            profile.learning_goals || ''

        };

        this.profileForm.patchValue(this.savedProfile);

        // Profile starts in view mode
        this.profileForm.disable();

      },

      error: (error) => {

        this.errorMessage =
          error.error?.message || 'Failed to load profile.';

      }

    });

  }


  // Enable only the editable profile fields
  editProfile() {

    this.message = '';
    this.errorMessage = '';

    this.editMode = true;

    this.profileForm.controls.highest_qualification.enable();
    this.profileForm.controls.department.enable();
    this.profileForm.controls.study_year.enable();
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


    // Send only editable profile fields to the backend
    const profileData = {

      highest_qualification:
        this.profileForm.controls.highest_qualification.value || '',

      department:
        this.profileForm.controls.department.value || '',

      study_year:
        this.profileForm.controls.study_year.value || '',

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