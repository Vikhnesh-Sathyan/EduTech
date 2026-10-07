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
  private router: Router
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

}
