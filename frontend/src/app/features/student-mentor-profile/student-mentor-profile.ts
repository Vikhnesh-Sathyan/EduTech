// Displays the public profile of a selected mentor

import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  StudentMentorService
} from '../../services/student-mentor.service';


@Component({
  selector: 'app-student-mentor-profile',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './student-mentor-profile.html',
  styleUrl: './student-mentor-profile.css'
})
export class StudentMentorProfile implements OnInit {

  // Stores the mentor profile
  mentor = signal<any | null>(null);

  // Controls loading state
  loading = signal(false);

  // Stores error message
  errorMessage = signal('');


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentMentorService: StudentMentorService
  ) {}


  ngOnInit(): void {

    const mentorId = Number(
      this.route.snapshot.paramMap.get('mentorId')
    );

    if (!mentorId) {

      this.errorMessage.set(
        'Invalid mentor profile.'
      );

      return;

    }

    this.loadMentorProfile(mentorId);

  }


  // Loads the selected mentor profile
  loadMentorProfile(mentorId: number): void {

    this.loading.set(true);

    this.errorMessage.set('');

    this.studentMentorService
      .getMentorProfile(mentorId)
      .subscribe({

        next: (response: any) => {

          console.log(
            'MENTOR PROFILE RESPONSE:',
            response
          );

          this.mentor.set(
            response.mentor
          );

          this.loading.set(false);

        },

        error: (error) => {

          console.error(
            'Failed to load mentor profile:',
            error
          );

          this.errorMessage.set(
            error?.error?.message ||
            'Unable to load mentor profile.'
          );

          this.loading.set(false);

        }

      });

  }


  // Returns the student to mentor listing
  goBack(): void {

    this.router.navigate([
      '/mentors'
    ]);

  }


  // Sends a mentorship request
  requestMentorship(): void {

    const mentorId =
      this.mentor()?.mentor_id;

    if (!mentorId) {
      return;
    }

    this.studentMentorService
      .requestMentorship(mentorId)
      .subscribe({

        next: (response: any) => {

          console.log(
            'MENTORSHIP REQUEST RESPONSE:',
            response
          );

          alert(
            'Mentorship request sent successfully.'
          );

        },

        error: (error) => {

          console.error(
            'Mentorship request failed:',
            error
          );

          alert(
            error?.error?.message ||
            'Failed to send mentorship request.'
          );

        }

      });

  }

}
