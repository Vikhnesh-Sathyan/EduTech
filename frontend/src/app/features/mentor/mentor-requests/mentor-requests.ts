// Displays mentorship requests received from students

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
  Mentor
} from '../../../services/mentor';

import {
  ToastService
} from '../../../services/toast.service';


@Component({
  selector: 'app-mentor-requests',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './mentor-requests.html',
  styleUrl: './mentor-requests.css'
})
export class MentorRequests implements OnInit {


  // Stores incoming mentorship requests
  requests = signal<any[]>([]);

  // Controls loading state
  loading = signal(false);

  // Stores error message
  errorMessage = signal('');


  constructor(
    private mentorService: Mentor,
    private router: Router,
    private toastService: ToastService
  ) {}


  ngOnInit(): void {

    this.loadRequests();

  }


  // Loads pending mentorship requests
  loadRequests(): void {

    this.loading.set(true);

    this.errorMessage.set('');

    this.mentorService
      .getMentorRequests()
      .subscribe({

        next: (response: any) => {

          console.log(
            'MENTOR REQUESTS RESPONSE:',
            response
          );

          this.requests.set(
            response.requests || []
          );

          this.loading.set(false);

        },

        error: (error) => {

          console.error(
            'Failed to load mentor requests:',
            error
          );

          this.errorMessage.set(
            'Unable to load mentorship requests.'
          );

          this.loading.set(false);

          // Show error notification
          this.toastService.error(
            'Unable to load mentorship requests.'
          );

        }

      });

  }


  // Opens the selected student's profile
  viewStudentProfile(studentId: number): void {

    this.router.navigate([
      '/mentor-student-profile',
      studentId
    ]);

  }


  // Accepts a mentorship request
  acceptRequest(relationshipId: number): void {

    this.mentorService
      .acceptMentorship(relationshipId)
      .subscribe({

        next: (response: any) => {

          console.log(
            'MENTORSHIP ACCEPT RESPONSE:',
            response
          );

          // Remove the accepted request from the pending list
          this.requests.update((requests) =>
            requests.filter(
              (request) =>
                request.id !== relationshipId
            )
          );

          // Show success notification
          this.toastService.success(
            'Mentorship request accepted.'
          );

        },

        error: (error) => {

          console.error(
            'Mentorship acceptance failed:',
            error
          );

          // Show error notification
          this.toastService.error(
            error?.error?.message ||
            'Failed to accept mentorship request.'
          );

        }

      });

  }


  // Rejects a mentorship request
  rejectRequest(relationshipId: number): void {

    this.mentorService
      .rejectMentorship(relationshipId)
      .subscribe({

        next: (response: any) => {

          console.log(
            'MENTORSHIP REJECT RESPONSE:',
            response
          );

          // Remove the rejected request from the pending list
          this.requests.update((requests) =>
            requests.filter(
              (request) =>
                request.id !== relationshipId
            )
          );

          // Show success notification
          this.toastService.success(
            'Mentorship request rejected.'
          );

        },

        error: (error) => {

          console.error(
            'Mentorship rejection failed:',
            error
          );

          // Show error notification
          this.toastService.error(
            error?.error?.message ||
            'Failed to reject mentorship request.'
          );

        }

      });

  }

}
