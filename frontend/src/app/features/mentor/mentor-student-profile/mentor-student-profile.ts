// Displays a student profile for a mentor

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
  Mentor
} from '../../../services/mentor';


@Component({
  selector: 'app-mentor-student-profile',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './mentor-student-profile.html',
  styleUrl: './mentor-student-profile.css'
})
export class MentorStudentProfile implements OnInit {

  // Stores the student profile
  student = signal<any | null>(null);

  // Controls loading state
  loading = signal(false);

  // Stores error message
  errorMessage = signal('');


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mentorService: Mentor
  ) {}


  ngOnInit(): void {

    const studentId = Number(
      this.route.snapshot.paramMap.get('studentId')
    );

    if (!studentId) {

      this.errorMessage.set(
        'Invalid student profile.'
      );

      return;

    }

    this.loadStudentProfile(studentId);

  }


  // Loads the selected student profile
  loadStudentProfile(studentId: number): void {

    this.loading.set(true);

    this.errorMessage.set('');

    this.mentorService
      .getStudentProfile(studentId)
      .subscribe({

        next: (response: any) => {

          console.log(
            'STUDENT PROFILE RESPONSE:',
            response
          );

          this.student.set(
            response.student
          );

          this.loading.set(false);

        },

        error: (error) => {

          console.error(
            'Failed to load student profile:',
            error
          );

          this.errorMessage.set(
            error?.error?.message ||
            'Unable to load student profile.'
          );

          this.loading.set(false);

        }

      });

  }


  // Returns the mentor to requests
  goBack(): void {

    this.router.navigate([
      '/mentor-requests'
    ]);

  }

}
