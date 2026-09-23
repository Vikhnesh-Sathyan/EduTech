// Handles the student's profile page

import { Component } from '@angular/core';

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
export class Profile {

  message = '';
  errorMessage = '';

  profileForm;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService
  ) {

    this.profileForm = this.fb.group({
      highest_qualification: ['', Validators.required],
      department: ['', Validators.required],
      study_year: ['', Validators.required],
      career_goal: ['', Validators.required],
      learning_goals: ['', Validators.required]
    });

  }

  // Load the authenticated student's existing profile
  loadProfile() {
    this.profileService.getProfile().subscribe({
      next: (response: any) => {

        const profile = response.profile;

        this.profileForm.patchValue({
          highest_qualification: profile.highest_qualification || '',
          department: profile.department || '',
          study_year: profile.study_year || '',
          career_goal: profile.career_goal || '',
          learning_goals: profile.learning_goals || ''
        });

      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Failed to load profile.';
      }
    });
  }

  // Save the student's profile
  onSubmit() {

    this.message = '';
    this.errorMessage = '';

    if (this.profileForm.invalid) {
      this.errorMessage =
        'Please complete all required profile details.';
      return;
    }

    this.profileService.saveProfile(
      this.profileForm.getRawValue() as {
        highest_qualification: string;
        department: string;
        study_year: string;
        career_goal: string;
        learning_goals: string;
      }
    ).subscribe({
      next: (response: any) => {
        this.message = response.message;
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Failed to save profile.';
      }
    });
  }
}