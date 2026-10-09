
// Displays mentors who were previously connected to the student

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
  selector: 'app-student-previous-mentors',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './student-previous-mentors.html',
  styleUrl: './student-previous-mentors.css'
})
export class StudentPreviousMentors implements OnInit {

  // Stores previous mentors
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

    this.loadPreviousMentors();

  }

  // Loads the student's previous mentors
  loadPreviousMentors(): void {

    this.loading.set(true);

    this.errorMessage.set('');

    this.studentMentorService
      .getPreviousMentors()
      .subscribe({

        next: (response: any) => {

          console.log(
            'PREVIOUS MENTORS:',
            response
          );

          this.mentors.set(
            response.mentors || []
          );

          this.loading.set(false);

        },

        error: (error) => {

          console.error(
            'Failed to load previous mentors:',
            error
          );

          this.errorMessage.set(
            error?.error?.message ||
            'Unable to load previous mentors.'
          );

          this.toastService.error(
            error?.error?.message ||
            'Unable to load previous mentors.'
          );

          this.loading.set(false);

        }

      });

  }

  // Opens the mentor's profile
  viewProfile(mentorId: number): void {

    this.router.navigate([
      '/mentors',
      mentorId
    ]);

  }

  // Returns to the My Mentor page
  goBack(): void {

    this.router.navigate([
      '/student-my-mentor'
    ]);

  }

}
