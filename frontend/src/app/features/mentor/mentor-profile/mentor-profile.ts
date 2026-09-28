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
  // AVAILABILITY DAYS
  // ==========================================

  // Days displayed in the weekly availability selector
  days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  // Stores the days selected by the mentor
  selectedDays: string[] = [];


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


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

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

      // This field is still kept because
      // the backend expects availability_days.
      // The actual UI selection is handled by selectedDays.
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
          // Load availability days
          // ------------------------------------------

          // Convert the database string:
          //
          // "Monday, Wednesday, Friday"
          //
          // into:
          //
          // ["Monday", "Wednesday", "Friday"]

          this.selectedDays = profile.availability_days
            ? profile.availability_days
                .split(',')
                .map((day: string) => day.trim())
                .filter((day: string) => day.length > 0)
            : [];


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

            // Keep the database value here.
            // The visible day buttons use selectedDays.
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
  // TOGGLE AVAILABILITY DAY
  // ==========================================

  // Called when the mentor clicks a day button
  toggleDay(day: string): void {

    // Check whether the day is already selected
    if (this.selectedDays.includes(day)) {

      // Remove the selected day
      this.selectedDays =
        this.selectedDays.filter(
          selectedDay => selectedDay !== day
        );

    } else {

      // Add the day
      this.selectedDays = [
        ...this.selectedDays,
        day
      ];

    }

  }


  // ==========================================
  // CHECK SELECTED DAY
  // ==========================================

  // Used by HTML to know whether
  // a particular day should appear selected
  isDaySelected(day: string): boolean {

    return this.selectedDays.includes(day);

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


    // ------------------------------------------
    // Prepare form data
    // ------------------------------------------

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

      // Convert selected days array into
      // one string for the backend/database.
      //
      // ["Monday", "Wednesday", "Friday"]
      //
      // becomes:
      //
      // "Monday, Wednesday, Friday"

      availability_days:
        this.selectedDays.join(', '),

      availability_start_time:
        this.profileForm.value.availability_start_time || '',

      availability_end_time:
        this.profileForm.value.availability_end_time || ''

    };


    // ------------------------------------------
    // Send profile data to backend
    // ------------------------------------------

    this.mentorService
      .saveProfile(profileData)
      .subscribe({

        next: (response: any) => {

          // Keep the form field synchronized
          this.profileForm.patchValue({

            availability_days:
              this.selectedDays.join(', ')

          });


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
// ==========================================
// SUBMIT FOR VERIFICATION
// ==========================================

submitForVerification(): void {

  this.message.set('');
  this.errorMessage.set('');


  // ==========================================
  // CHECK REQUIRED PROFILE INFORMATION
  // ==========================================

  const professionalTitle =
    this.profileForm.value.professional_title?.trim() || '';

  const specialization =
    this.profileForm.value.specialization?.trim() || '';

  const bio =
    this.profileForm.value.bio?.trim() || '';

  const skills =
    this.profileForm.value.skills?.trim() || '';

  const experience =
    this.profileForm.value.experience_years;

  const startTime =
    this.profileForm.value.availability_start_time || '';

  const endTime =
    this.profileForm.value.availability_end_time || '';


  // ==========================================
  // FIND MISSING INFORMATION
  // ==========================================

  const missingFields: string[] = [];


  if (!professionalTitle) {
    missingFields.push('Professional Title');
  }

  if (!specialization) {
    missingFields.push('Specialization');
  }

  if (!bio) {
    missingFields.push('Professional Bio');
  }

  if (!skills) {
    missingFields.push('Skills');
  }

if (
  experience === null ||
  experience === undefined
) {
  missingFields.push('Experience');
}

  if (this.selectedDays.length === 0) {
    missingFields.push('Available Days');
  }

  if (!startTime) {
    missingFields.push('Start Time');
  }

  if (!endTime) {
    missingFields.push('End Time');
  }


  // ==========================================
  // STOP IF PROFILE IS INCOMPLETE
  // ==========================================

  if (missingFields.length > 0) {

    this.errorMessage.set(
      `Please complete: ${missingFields.join(', ')}.`
    );

    return;
  }


  // ==========================================
  // SUBMIT PROFILE
  // ==========================================

  this.mentorService
    .submitForVerification()
    .subscribe({

      next: (response: any) => {

        // Update verification status
        this.verificationStatus.set('pending');


        // Clear old rejection feedback
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