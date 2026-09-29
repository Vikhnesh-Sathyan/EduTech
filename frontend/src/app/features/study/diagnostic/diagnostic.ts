import { Component, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { StudentDiagnostic } from '../../../services/student-diagnostic';
import { Router } from '@angular/router';

@Component({
  selector: 'app-diagnostic',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './diagnostic.html',
  styleUrl: './diagnostic.css'
})
export class Diagnostic implements OnInit {

  // ==========================================
  // DIAGNOSTIC DATA
  // ==========================================

  // Diagnostic attempt ID
  attemptId = signal<number | null>(null);

  // Selected subject
  subject = signal<any>(null);

  // Questions received from backend
  questions = signal<any[]>([]);


  // ==========================================
  // QUESTION STATE
  // ==========================================

  // Current question index
  currentQuestionIndex = signal(0);

  // Selected answer for current question
  selectedAnswer = signal('');


  // ==========================================
  // ANSWER STATE
  // ==========================================

  // Store selected answers locally
  //
  // Example:
  // {
  //   5: 'B',
  //   8: 'C'
  // }
  //
  // Key   = question ID
  // Value = selected option
  answers = signal<Record<number, string>>({});


  // ==========================================
  // PAGE STATE
  // ==========================================

  loading = signal(true);

  errorMessage = signal('');

  // Prevent multiple API requests
  savingAnswer = signal(false);


  constructor(
    private studentDiagnosticService: StudentDiagnostic,
    private router: Router
  ) {}


  // ==========================================
  // INITIALIZE
  // ==========================================

  ngOnInit(): void {

    // Get data passed from Subject page
    const state = history.state;


    // Check whether diagnostic data exists
    if (
      !state?.['attemptId'] ||
      !state?.['questions']
    ) {

      this.errorMessage.set(
        'Diagnostic data is unavailable'
      );

      this.loading.set(false);

      return;
    }


    // Store diagnostic data
    this.attemptId.set(
      state['attemptId']
    );

    this.subject.set(
      state['subject']
    );

    this.questions.set(
      state['questions']
    );


    // Show first question
    this.loadCurrentAnswer();

    this.loading.set(false);
  }


  // ==========================================
  // GET CURRENT QUESTION
  // ==========================================

  getCurrentQuestion(): any {

    return this.questions()[
      this.currentQuestionIndex()
    ];
  }


  // ==========================================
  // LOAD CURRENT ANSWER
  // ==========================================

  loadCurrentAnswer(): void {

    const currentQuestion =
      this.getCurrentQuestion();


    if (!currentQuestion) {

      this.selectedAnswer.set('');

      return;
    }


    const savedAnswer =
      this.answers()[currentQuestion.id];


    // Restore previous answer
    this.selectedAnswer.set(
      savedAnswer || ''
    );
  }


  // ==========================================
  // SELECT ANSWER
  // ==========================================

  selectAnswer(option: string): void {

    // Do not allow answer changes
    // while an API request is running
    if (this.savingAnswer()) {
      return;
    }


    this.selectedAnswer.set(option);


    const currentQuestion =
      this.getCurrentQuestion();


    if (!currentQuestion) {
      return;
    }


    // Store answer locally
    this.answers.update(
      currentAnswers => ({
        ...currentAnswers,
        [currentQuestion.id]: option
      })
    );
  }


  // ==========================================
  // PREVIOUS QUESTION
  // ==========================================

  previousQuestion(): void {

    // Do nothing if already on first question
    if (
      this.currentQuestionIndex() === 0
    ) {
      return;
    }


    // Move backward
    this.currentQuestionIndex.update(
      index => index - 1
    );


    // Restore previously selected answer
    this.loadCurrentAnswer();


    // Clear any old error
    this.errorMessage.set('');
  }


  // ==========================================
  // NEXT QUESTION
  // ==========================================

  nextQuestion(): void {

    // Do not continue without selecting an answer
    if (!this.selectedAnswer()) {
      return;
    }


    // Prevent multiple clicks
    if (this.savingAnswer()) {
      return;
    }


    const attemptId =
      this.attemptId();


    const currentQuestion =
      this.getCurrentQuestion();


    if (
      !attemptId ||
      !currentQuestion
    ) {

      this.errorMessage.set(
        'Diagnostic data is unavailable'
      );

      return;
    }


    this.savingAnswer.set(true);

    this.errorMessage.set('');


    // ==========================================
    // SAVE ANSWER
    // ==========================================

    this.studentDiagnosticService
      .submitAnswer(
        attemptId,
        currentQuestion.id,
        this.selectedAnswer()
      )
      .subscribe({

        // ==========================================
        // ANSWER SAVED
        // ==========================================

        next: () => {

          // Check whether this is the final question
          if (
            this.currentQuestionIndex()
            <
            this.questions().length - 1
          ) {

            // Move to next question
            this.currentQuestionIndex.update(
              index => index + 1
            );


            // Load answer if question was
            // previously visited
            this.loadCurrentAnswer();


            this.savingAnswer.set(false);

            return;
          }


          // ==========================================
          // FINAL QUESTION
          // ==========================================

          this.completeDiagnostic(
            attemptId
          );
        },


        // ==========================================
        // ANSWER SAVE FAILED
        // ==========================================

        error: (error) => {

          console.error(
            'Failed to save diagnostic answer:',
            error
          );


          this.errorMessage.set(
            error.error?.message ||
            'Failed to save answer. Please try again.'
          );


          this.savingAnswer.set(false);
        }

      });
  }


  // ==========================================
  // COMPLETE DIAGNOSTIC
  // ==========================================

  private completeDiagnostic(
    attemptId: number
  ): void {

    this.studentDiagnosticService
      .completeDiagnostic(attemptId)
      .subscribe({

        // ==========================================
        // COMPLETED
        // ==========================================

        next: (response: any) => {

          console.log(
            'Diagnostic completed:',
            response
          );


          this.savingAnswer.set(false);


          // Navigate to the premium
          // diagnostic result page.
          //
          // The complete result returned
          // from the backend is passed
          // through router state.

          this.router.navigate(
            ['/diagnostic-result'],
            {
              state: {
                result: response.result
              }
            }
          );
        },


        // ==========================================
        // COMPLETION FAILED
        // ==========================================

        error: (error) => {

          console.error(
            'Failed to complete diagnostic:',
            error
          );


          this.errorMessage.set(
            error.error?.message ||
            'Failed to complete diagnostic.'
          );


          this.savingAnswer.set(false);
        }

      });
  }

}