// Handles the mentor profile page and profile form

import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Mentor } from '../../../services/mentor';

@Component({
  selector: 'app-mentor-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './mentor-profile.html',
  styleUrl: './mentor-profile.css'
})
export class MentorProfile implements OnInit {

  // ==========================================
  // MENTOR ACCOUNT INFORMATION
  // ==========================================

  name = signal('');

  email = signal('');


  // ==========================================
  // VERIFICATION INFORMATION
  // ==========================================

  // Stores current verification status
  verificationStatus = signal('pending');

  // Stores admin feedback/rejection reason
  verificationNote = signal('');


  // ==========================================
  // SUCCESS AND ERROR MESSAGES
  // ==========================================

  message = signal('');

  errorMessage = signal('');


  // ==========================================
  // MENTOR PROFILE FORM
  // ==========================================

  profileForm;


  constructor(
    private fb: FormBuilder,
    private mentorService: Mentor
  ) {

    // Create the mentor profile form
    this.profileForm = this.fb.group({

      professional_title: [
        '',
        Validators.required
      ],

      specialization: [
        '',
        Validators.required
      ],

      bio: [''],

      experience_years: [
        null as number | null
      ],

      skills: [''],

      linkedin_url: [''],

      github_url: [''],

      availability_days: [''],

      availability_start_time: [''],

      availability_end_time: ['']

    });

  }


  // ==========================================
  // PAGE INITIALIZATION
  // ==========================================

  // Load mentor profile when page opens
  ngOnInit(): void {

    this.loadProfile();

  }


  // ==========================================
  // LOAD MENTOR PROFILE
  // ==========================================

  loadProfile(): void {

    this.mentorService
      .getProfile()
      .subscribe({

        next: (response: any) => {

          const profile = response.profile;


          // ------------------------------------------
          // Account information
          // ------------------------------------------

          this.name.set(
            profile.name || ''
          );

          this.email.set(
            profile.email || ''
          );


          // ------------------------------------------
          // Verification information
          // ------------------------------------------

          this.verificationStatus.set(
            profile.verification_status || 'pending'
          );

          this.verificationNote.set(
            profile.verification_note || ''
          );


          // ------------------------------------------
          // Put database values into the form
          // ------------------------------------------

          this.profileForm.patchValue({

            professional_title:
              profile.professional_title || '',

            specialization:
              profile.specialization || '',

            bio:
              profile.bio || '',

            experience_years:
              profile.experience_years ?? null,

            skills:
              profile.skills || '',

            linkedin_url:
              profile.linkedin_url || '',

            github_url:
              profile.github_url || '',

            availability_days:
              profile.availability_days || '',

            availability_start_time:
              profile.availability_start_time || '',

            availability_end_time:
              profile.availability_end_time || ''

          });

        },


        error: (error: any) => {

          this.errorMessage.set(
            error.error?.message ||
            'Failed to load mentor profile'
          );

        }

      });

  }


  // ==========================================
  // SAVE MENTOR PROFILE
  // ==========================================

  saveProfile(): void {

    this.message.set('');

    this.errorMessage.set('');


    // Stop if required fields are missing
    if (this.profileForm.invalid) {

      this.profileForm.markAllAsTouched();

      return;

    }


    // Prepare form data
    const profileData = {

      professional_title:
        this.profileForm.value.professional_title || '',

      specialization:
        this.profileForm.value.specialization || '',

      bio:
        this.profileForm.value.bio || '',

      experience_years:
        this.profileForm.value.experience_years ?? null,

      skills:
        this.profileForm.value.skills || '',

      linkedin_url:
        this.profileForm.value.linkedin_url || '',

      github_url:
        this.profileForm.value.github_url || '',

      availability_days:
        this.profileForm.value.availability_days || '',

      availability_start_time:
        this.profileForm.value.availability_start_time || '',

      availability_end_time:
        this.profileForm.value.availability_end_time || ''

    };


    // Send profile data to backend
    this.mentorService
      .saveProfile(profileData)
      .subscribe({

        next: (response: any) => {

          this.message.set(
            response.message ||
            'Profile saved successfully'
          );

        },


        error: (error: any) => {

          this.errorMessage.set(
            error.error?.message ||
            'Failed to save mentor profile'
          );

        }

      });

  }


  // ==========================================
  // SUBMIT FOR VERIFICATION
  // ==========================================

  submitForVerification(): void {

    this.message.set('');

    this.errorMessage.set('');


    this.mentorService
      .submitForVerification()
      .subscribe({

        next: (response: any) => {

          // Update status
          this.verificationStatus.set(
            'pending'
          );

          // Clear old admin rejection note
          this.verificationNote.set('');


          // Show success message
          this.message.set(
            response.message ||
            'Profile submitted for verification'
          );

        },


        error: (error: any) => {

          this.errorMessage.set(
            error.error?.message ||
            'Failed to submit profile for verification'
          );

        }

      });

  }

}