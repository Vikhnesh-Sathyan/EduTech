import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {
  StudentCodeLogicService
} from '../../../../../services/student/advanced/code-logic/code-logic.service';

interface CodeLogicProblem {
  id: number;
  title: string;
  description: string;
  mode: 'build_code' | 'understand_code';
  difficulty: 'easy' | 'medium' | 'hard';
  max_marks: number;
  language_name?: string;
  input_description?: string | null;
  output_description?: string | null;
  hint_text?: string | null;
  examples?: unknown[] | string;
  starter_code?: string | null;
  solution_code?: string | null;
  algorithm_steps?: unknown[] | string;
  prediction_questions?: unknown[] | string;
}

@Component({
  selector: 'app-student-code-logic-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './code-logic-details.html',
  styleUrl: './code-logic-details.css'
})
export class StudentCodeLogicDetails implements OnInit {
  readonly problem = signal<CodeLogicProblem | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  readonly activeStep = signal(0);

  readonly steps = [
    { label: 'Understand', number: 1 },
    { label: 'Think', number: 2 },
    { label: 'Arrange', number: 3 },
    { label: 'Code', number: 4 }
  ];

  readonly currentStep = computed(
    () => this.steps[this.activeStep()]
  );

  readonly isFirstStep = computed(
    () => this.activeStep() === 0
  );

  readonly isLastStep = computed(
    () => this.activeStep() === this.steps.length - 1
  );
  
  
readonly predictionAnswers = signal<Record<number, string>>({});
readonly submitting = signal(false);
readonly attemptStarted = signal(false);
readonly submissionMessage = signal('');
readonly submissionError = signal('');
readonly submissionResult = signal<any>(null);


constructor(
  public route: ActivatedRoute,
  private codeLogicService: StudentCodeLogicService
) {}


  ngOnInit(): void {
    const problemId = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(problemId) || problemId <= 0) {
      this.errorMessage.set('The selected problem ID is invalid.');
      this.loading.set(false);
      return;
    }

    this.loadProblem(problemId);
  }

  loadProblem(problemId: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.codeLogicService.getProblemDetails(problemId).subscribe({
      next: (response) => {
        const problem =
          response?.problem ??
          response?.data?.problem ??
          response?.data ??
          response;

        if (!problem || typeof problem !== 'object' || !problem.title) {
          this.errorMessage.set(
            'The server returned an unexpected problem response.'
          );
          this.loading.set(false);
          return;
        }

        
this.problem.set(problem as CodeLogicProblem);
this.loading.set(false);

this.startStudentAttempt(problemId);

      },
      error: (error) => {
        console.error('Unable to load problem details:', error);

        this.errorMessage.set(
          error.error?.message ??
          'Unable to load this problem. Please try again.'
        );

        this.loading.set(false);
      }
    });
  }

  goToStep(index: number): void {
    if (index >= 0 && index < this.steps.length) {
      this.activeStep.set(index);
    }
  }

  previousStep(): void {
    this.goToStep(this.activeStep() - 1);
  }

  nextStep(): void {
    this.goToStep(this.activeStep() + 1);
  }

  getModeLabel(mode: string): string {
    return mode === 'understand_code'
      ? 'Code → Logic'
      : 'Logic → Code';
  }

  getParsedContent(value: unknown): unknown[] {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      try {
        const parsed: unknown = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return [];
  }

  
startStudentAttempt(problemId: number): void {
  this.attemptStarted.set(false);
  this.submissionError.set('');

  this.codeLogicService.startAttempt(problemId).subscribe({
    next: () => {
      this.attemptStarted.set(true);
    },
    error: (error) => {
      console.error('Unable to start attempt:', error);

      this.submissionError.set(
        error.error?.message ??
        'Unable to start your attempt. Please try again.'
      );
    }
  });
}

setPredictionAnswer(index: number, answer: string): void {
  this.predictionAnswers.update(current => ({
    ...current,
    [index]: answer
  }));

  this.submissionMessage.set('');
  this.submissionError.set('');
}

submitPredictionAnswers(): void {
  const problem = this.problem();

  if (!problem || this.submitting()) {
    return;
  }

  const questions = this.getParsedContent(
    problem.prediction_questions
  );

  if (questions.length === 0) {
    this.submissionError.set(
      'There are no prediction questions to submit.'
    );
    return;
  }

  const answers = questions.map((question, index) => ({
    question: (question as any)?.question ?? `Question ${index + 1}`,
    answer: (this.predictionAnswers()[index] ?? '').trim(),
    marks: (question as any)?.marks ?? 0
  }));

  if (answers.some(item => !item.answer)) {
    this.submissionError.set(
      'Please answer every prediction question before submitting.'
    );
    return;
  }

  if (!this.attemptStarted()) {
    this.submissionError.set(
      'Your attempt has not started. Please try again.'
    );
    return;
  }

  this.submitting.set(true);
  this.submissionError.set('');
  this.submissionMessage.set('');

  this.codeLogicService.submitAttempt(problem.id, {
    submittedAnswer: JSON.stringify(answers),
    predictedOutput: answers
  }).subscribe({
    next: (response) => {
      this.submissionResult.set(response?.attempt ?? response);
      this.submissionMessage.set(
        response?.message ?? 'Your answers have been submitted successfully.'
      );
      this.submitting.set(false);
      this.attemptStarted.set(false);
    },
    error: (error) => {
      console.error('Unable to submit prediction answers:', error);

      this.submissionError.set(
        error.error?.message ??
        'Unable to submit your answers. Please try again.'
      );

      this.submitting.set(false);
    }
  });
}

}
