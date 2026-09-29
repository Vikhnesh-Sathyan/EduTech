import { Component, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-diagnostic',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './diagnostic.html',
  styleUrl: './diagnostic.css'
})
export class Diagnostic implements OnInit {

  // Diagnostic attempt ID
  attemptId = signal<number | null>(null);

  // Selected subject
  subject = signal<any>(null);

  // Questions received from backend
  questions = signal<any[]>([]);

  // Current question number
  currentQuestionIndex = signal(0);

  // Selected answer for current question
  selectedAnswer = signal('');

  // Page state
  loading = signal(true);
  errorMessage = signal('');

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {

    // Get data passed from Subject page
    const navigation = this.router.getCurrentNavigation();

    const state = navigation?.extras.state;

    // Check whether diagnostic data exists
   if (!state?.['attemptId'] || !state?.['questions']) {

      this.errorMessage.set(
        'Diagnostic data is unavailable'
      );

      this.loading.set(false);

      return;
    }

    // Store diagnostic data
    this.attemptId.set(state['attemptId']);
    this.subject.set(state['subject']);
    this.questions.set(state['questions']);

    this.loading.set(false);
  }


  // Get the currently displayed question
  getCurrentQuestion(): any {

    return this.questions()[
      this.currentQuestionIndex()
    ];
  }


  // Select an answer
  selectAnswer(option: string): void {

    this.selectedAnswer.set(option);
  }


  // Move to the next question
  nextQuestion(): void {

    // Do not continue without selecting an answer
    if (!this.selectedAnswer()) {
      return;
    }

    // Move to next question
    if (
      this.currentQuestionIndex()
      <
      this.questions().length - 1
    ) {

      this.currentQuestionIndex.update(
        index => index + 1
      );

      // Clear previous answer
      this.selectedAnswer.set('');
    }
  }

}