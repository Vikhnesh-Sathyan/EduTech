import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Study as StudyService } from '../../../services/study';

@Component({
  selector: 'app-subject-learning',
  standalone: true,
  imports: [],
  templateUrl: './subject-learning.html',
  styleUrl: './subject-learning.css'
})
export class Subject implements OnInit {

  subject = signal<any>(null);

  loading = signal(true);

  errorMessage = signal('');

  constructor(
    private route: ActivatedRoute,
    private studyService: StudyService,
    private router: Router
  ) {}

  ngOnInit(): void {

    // Get subject ID from /study/:subjectId
    const subjectId =
      this.route.snapshot.paramMap.get('subjectId');

    if (!subjectId) {

      this.errorMessage.set(
        'Subject ID is missing'
      );

      this.loading.set(false);

      return;
    }

    this.loadSubject(subjectId);
  }


  // Load the selected subject from the backend
  loadSubject(subjectId: string): void {

    this.studyService
      .getSubjectById(subjectId)
      .subscribe({

        next: (response: any) => {

          this.subject.set(
            response.subject
          );

          this.loading.set(false);

        },

        error: (error: any) => {

          console.error(
            'Failed to load subject:',
            error
          );

          this.errorMessage.set(
            error.error?.message ||
            'Failed to load subject'
          );

          this.loading.set(false);

        }

      });

  }
      // Start diagnostic for the selected subject
startDiagnostic(): void {

  const subjectId =
    this.route.snapshot.paramMap.get('subjectId');

  if (!subjectId) {
    this.errorMessage.set('Subject ID is missing');
    return;
  }

  this.studyService
    .startDiagnostic(subjectId)
    .subscribe({
    next: (response: any) => {

  this.router.navigate(
    [
      '/study',
      subjectId,
      'diagnostic'
    ],
    {
      state: {
        attemptId: response.attemptId,
        subject: response.subject,
        questions: response.questions
      }
    }
  );

},

      error: (error: any) => {

        console.error(
          'Failed to start diagnostic:',
          error
        );

        this.errorMessage.set(
          error.error?.message ||
          'Failed to start diagnostic'
        );

      }
    });
}
}