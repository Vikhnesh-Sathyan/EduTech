// Displays the student's currently connected mentor

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
} from '../../services/student-mentor.service';

import {
  ToastService
} from '../../services/toast.service';

@Component({
  selector: 'app-student-my-mentor',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './student-my-mentor.html',
  styleUrl: './student-my-mentor.css'
})
export class StudentMyMentor implements OnInit {

  // Stores the connected mentor
  mentor = signal<any | null>(null);

  // Stores previous mentors
  previousMentors = signal<any[]>([]);

  // Controls loading state
  loading = signal(false);

  // Stores error message
  errorMessage = signal('');

  // Controls the change mentor confirmation modal
  showChangeMentorModal = signal(false);

  constructor(
    private studentMentorService: StudentMentorService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {

    this.loadMyMentor();

    this.loadPreviousMentors();

  }

  // Loads the student's current mentor
  loadMyMentor(): void {

    this.loading.set(true);

    this.errorMessage.set('');

    this.studentMentorService
      .getMyMentor()
      .subscribe({

        next: (response: any) => {

          console.log(
            'MY MENTOR RESPONSE:',
            response
          );

          this.mentor.set(
            response.mentor
          );

          this.loading.set(false);

        },

        error: (error) => {

          console.error(
            'Failed to load my mentor:',
            error
          );

          this.errorMessage.set(
            error?.error?.message ||
            'Unable to load your mentor.'
          );

          this.toastService.error(
            error?.error?.message ||
            'Unable to load your mentor.'
          );

          this.loading.set(false);

        }

      });

  }

  // Loads mentors who were previously connected
  loadPreviousMentors(): void {

    this.studentMentorService
      .getPreviousMentors()
      .subscribe({

        next: (response: any) => {

          console.log(
            'PREVIOUS MENTORS RESPONSE:',
            response
          );

          this.previousMentors.set(
            response.mentors || []
          );

        },

        error: (error) => {

          console.error(
            'Failed to load previous mentors:',
            error
          );

        }

      });

  }

  // Opens the change mentor confirmation modal
  changeMentor(): void {

    this.showChangeMentorModal.set(true);

  }

  // Opens the previous mentors page
  viewPreviousMentors(): void {

    this.router.navigate([
      '/previous-mentors'
    ]);

  }

  // Closes the change mentor confirmation modal
  closeChangeMentorModal(): void {

    this.showChangeMentorModal.set(false);

  }

  // Confirms the change mentor action
  confirmChangeMentor(): void {

    this.showChangeMentorModal.set(false);

    this.router.navigate([
      '/mentor-recommendations'
    ]);

  }

}
