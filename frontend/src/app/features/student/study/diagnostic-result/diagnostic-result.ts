import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { StudentDiagnostic } from '../../../../services/student/student-diagnostic';

@Component({
  selector: 'app-diagnostic-result',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './diagnostic-result.html',
  styleUrl: './diagnostic-result.css'
})
export class DiagnosticResult implements OnInit {

  // Complete diagnostic result
  result = signal<any>(null);

  // Page loading state
  loading = signal(true);

  // Error message
  errorMessage = signal('');

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private studentDiagnosticService: StudentDiagnostic
  ) {}

  ngOnInit(): void {

    // Get subject ID from /diagnostic-result/:subjectId
    const subjectId =
      this.route.snapshot.paramMap.get('subjectId');

    if (!subjectId) {

      this.errorMessage.set(
        'Subject ID is missing'
      );

      this.loading.set(false);

      return;
    }

    // Load saved diagnostic result
    // from the backend.
    this.loadDiagnosticResult(
      Number(subjectId)
    );
  }


  // ==========================================
  // LOAD DIAGNOSTIC RESULT
  // ==========================================

  loadDiagnosticResult(
    subjectId: number
  ): void {

    this.studentDiagnosticService
      .getDiagnosticResult(subjectId)
      .subscribe({

        next: (response: any) => {

          // Store complete result
          this.result.set(
            response.result
          );

          this.loading.set(false);

        },

        error: (error: any) => {

          console.error(
            'Failed to load diagnostic result:',
            error
          );

          this.errorMessage.set(
            error.error?.message ||
            'Failed to load diagnostic result'
          );

          this.loading.set(false);

        }

      });

  }

}