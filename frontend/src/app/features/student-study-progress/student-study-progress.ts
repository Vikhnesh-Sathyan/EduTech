import { Component, OnInit, signal } from '@angular/core';

import { StudentLearning } from '../../services/student-learning';

@Component({
  selector: 'app-student-study-progress',
  standalone: true,
  imports: [],
  templateUrl: './student-study-progress.html',
  styleUrl: './student-study-progress.css'
})
export class StudentStudyProgress implements OnInit {

  subjects = signal<any[]>([]);
  overall = signal<any | null>(null);

  loading = signal(true);
  errorMessage = signal('');

  constructor(
    private studentLearningService: StudentLearning
  ) {}

  ngOnInit(): void {
    this.loadStudyProgress();
  }

  loadStudyProgress(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.studentLearningService
      .getAllSubjectsStudyProgress()
      .subscribe({

        next: (response: any) => {

          console.log(
            'ALL STUDY PROGRESS:',
            response
          );

          this.subjects.set(
            response.subjects || []
          );

          this.overall.set(
            response.overall || null
          );

          this.loading.set(false);
        },

        error: (error: any) => {

          console.error(
            'Failed to load study progress:',
            error
          );

          this.errorMessage.set(
            error.error?.message ||
            'Failed to load study progress'
          );

          this.loading.set(false);
        }

      });
  }
}