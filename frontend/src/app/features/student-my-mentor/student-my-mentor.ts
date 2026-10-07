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

    this.loadMyMentor();

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


  // Opens mentor recommendations
  changeMentor(): void {

    this.router.navigate([
      '/mentor-recommendations'
    ]);

  }

}
