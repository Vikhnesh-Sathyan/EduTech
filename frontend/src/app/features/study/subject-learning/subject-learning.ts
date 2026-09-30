import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Study as StudyService } from '../../../services/study';
import { StudentDiagnostic } from '../../../services/student-diagnostic';

@Component({
  selector: 'app-subject-learning',
  standalone: true,
  imports: [],
  templateUrl: './subject-learning.html',
  styleUrl: './subject-learning.css'
})
export class Subject implements OnInit {

  // Selected subject details
  subject = signal<any>(null);

  // Page loading state
  loading = signal(true);

  // Error message shown on the page
  errorMessage = signal('');

  // Whether the student has already completed the diagnostic
  diagnosticCompleted = signal(false);

  // Previously completed diagnostic result
  diagnosticResult = signal<any>(null);

  // Loading state while checking diagnostic status
  checkingDiagnostic = signal(true);

  constructor(
    private route: ActivatedRoute,
    private studyService: StudyService,
    private studentDiagnosticService: StudentDiagnostic,
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
      this.checkingDiagnostic.set(false);

      return;
    }

    // Load the selected subject
    this.loadSubject(subjectId);

    // Check whether diagnostic has already been completed
    this.checkDiagnosticResult(
      Number(subjectId)
    );
  }


  // ==========================================
  // LOAD SUBJECT
  // ==========================================

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


  // ==========================================
  // CHECK DIAGNOSTIC RESULT
  // ==========================================

  // Check whether the student has already
  // completed a diagnostic for this subject
  checkDiagnosticResult(
    subjectId: number
  ): void {

    this.studentDiagnosticService
      .getDiagnosticResult(subjectId)
      .subscribe({

        next: (response: any) => {

          // A completed diagnostic exists
          this.diagnosticCompleted.set(true);

          // Store the previous result
          this.diagnosticResult.set(
            response.result
          );

          this.checkingDiagnostic.set(false);

        },

        error: (error: any) => {

          // 404 means the student has not
          // completed the diagnostic yet
          if (error.status === 404) {

            this.diagnosticCompleted.set(false);

          } else {

            console.error(
              'Failed to check diagnostic result:',
              error
            );

          }

          this.checkingDiagnostic.set(false);

        }

      });

  }


  // ==========================================
  // START DIAGNOSTIC
  // ==========================================

  // Start a new diagnostic for the selected subject
  startDiagnostic(): void {

    const subjectId =
      this.route.snapshot.paramMap.get('subjectId');

    if (!subjectId) {

      this.errorMessage.set(
        'Subject ID is missing'
      );

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


  // ==========================================
  // VIEW PREVIOUS RESULT
  // ==========================================

  // Open the previously completed diagnostic result
  viewDiagnosticResult(): void {

    const subjectId =
      this.route.snapshot.paramMap.get('subjectId');

    if (!subjectId) {

      this.errorMessage.set(
        'Subject ID is missing'
      );

      return;
    }

    this.router.navigate(
      [
        '/diagnostic-result',
        subjectId
      ]
    );

  }

startLearning(): void {

  const subjectId =
    this.route.snapshot.paramMap.get('subjectId');

  if (!subjectId) {
    return;
  }

  // Navigate to the student learning page
  this.router.navigate([
    '/study',
    subjectId,
    'learning'
  ]);

}

}