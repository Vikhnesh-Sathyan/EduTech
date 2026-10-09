
// Displays mentor recommendations for the current student

import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router
} from '@angular/router';

import {
  StudentMentorService
} from '../../../../services/student/student-mentor.service';


import {
  ToastService
} from '../../../../services/toast.service';

@Component({
  selector: 'app-student-mentor-recommendations',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './student-mentor-recommendations.html',
  styleUrl: './student-mentor-recommendations.css'
})
export class StudentMentorRecommendations implements OnInit {

  // Stores recommended mentors
  mentors = signal<any[]>([]);

  // Controls loading state
  loading = signal(false);

  // Stores error message
  errorMessage = signal('');

  constructor(
    private studentMentorService: StudentMentorService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadRecommendations();
  }

  // Loads recommended mentors
  loadRecommendations(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.studentMentorService
      .getMentorRecommendations()
      .subscribe({
        next: (response: any) => {

          console.log(
            'MENTOR RECOMMENDATIONS RESPONSE:',
            response
          );

          this.mentors.set(
            response.mentors || []
          );

          this.loading.set(false);
        },

error: (error) => {

  console.error(
    'Failed to load mentor recommendations:',
    error
  );

  this.errorMessage.set(
    error?.error?.message ||
    'Unable to load mentor recommendations.'
  );

  // Show error notification
  this.toastService.error(
    error?.error?.message ||
    'Unable to load mentor recommendations.'
  );

  this.loading.set(false);
}

      });
  }

  // Opens the mentor profile
  viewProfile(mentorId: number): void {

    this.router.navigate([
      '/mentors',
      mentorId
    ]);
  }

  // Sends a mentorship request
// Sends a mentorship request to the selected mentor
requestMentorship(mentorId: number): void {

  this.studentMentorService
    .requestMentorship(mentorId)
    .subscribe({

      next: () => {

        // Update the button immediately
        this.mentors.update((mentors) =>
          mentors.map((mentor) =>
            mentor.mentor_id === mentorId
              ? {
                  ...mentor,
                  relationship_status: 'pending'
                }
              : mentor
          )
        );

        // Show success notification
        this.toastService.success(
          'Mentorship request sent successfully.'
        );
      },

      error: (error) => {

        console.error(
          'Mentorship request failed:',
          error
        );

        // Show error notification
        this.toastService.error(
          error?.error?.message ||
          'Failed to send mentorship request.'
        );
      }

    });
}


// Skips the selected mentor
skipMentor(mentorId: number): void {

  this.mentors.update((mentors) =>
    mentors.filter(
      (mentor) =>
        mentor.mentor_id !== mentorId
    )
  );

}


  // Returns to the mentor directory
  goBack(): void {

    this.router.navigate([
      '/mentors'
    ]);
  }
}
