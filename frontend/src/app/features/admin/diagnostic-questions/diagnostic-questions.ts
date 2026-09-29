import { Component, OnInit, signal } from '@angular/core';
import { AdminDiagnostic } from '../../../services/admin-diagnostic';

@Component({
  selector: 'app-diagnostic-questions',
  standalone: true,
  imports: [],
  templateUrl: './diagnostic-questions.html',
  styleUrl: './diagnostic-questions.css'
})
export class DiagnosticQuestions implements OnInit {

  // All diagnostic questions
  questions = signal<any[]>([]);

  // Page loading state
  loading = signal(true);

  // Error message
  errorMessage = signal('');

  // Show Add Question form
  showForm = signal(false);

  // Active subjects
  subjects = signal<any[]>([]);

  // Subject loading state
  loadingSubjects = signal(false);

  constructor(
    private adminDiagnosticService: AdminDiagnostic
  ) {}

  ngOnInit(): void {
    this.loadQuestions();
  }

  // Load questions from backend
  loadQuestions(): void {

    this.adminDiagnosticService
      .getQuestions()
      .subscribe({

        next: (response: any) => {

          this.questions.set(
            response.questions || []
          );

          this.loading.set(false);
        },

        error: (error: any) => {

          console.error(
            'Failed to load diagnostic questions:',
            error
          );

          this.errorMessage.set(
            error.error?.message ||
            'Failed to load diagnostic questions'
          );

          this.loading.set(false);
        }

      });
  }

  // Open Add Question form
  openAddQuestion(): void {

    this.showForm.set(true);

    this.loadSubjects();
  }

  // Load active subjects
  loadSubjects(): void {

    this.loadingSubjects.set(true);

    this.adminDiagnosticService
      .getSubjects()
      .subscribe({

        next: (response: any) => {

          this.subjects.set(
            response.subjects || []
          );

          this.loadingSubjects.set(false);
        },

        error: (error: any) => {

          console.error(
            'Failed to load subjects:',
            error
          );

          this.loadingSubjects.set(false);
        }

      });
  }

}