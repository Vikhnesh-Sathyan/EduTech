import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { RouterLink } from '@angular/router';

import {
  StudentDailyQuizService,
  QuizAnswerSubmission
} from '../../../../services/student/daily-quiz/student-daily-quiz.service';

// ==========================================
// QUIZ INTERFACES
// ==========================================

interface QuizOption {
  option_id: number;
  option_text: string;
  option_order: number;
}

interface QuizQuestion {
  question_id: number;
  question_text: string;
  question_order: number;
  options: QuizOption[];
}

interface QuizWorkspace {
  id: number;
  title: string;
  instructions: string;
  subject_name: string;
  expires_at: string;
  questions: QuizQuestion[];
}

@Component({
  selector: 'app-daily-quiz-workspace',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './daily-quiz-workspace.html',
  styleUrl: './daily-quiz-workspace.css'
})
export class DailyQuizWorkspace implements OnInit {

  // ==========================================
  // STATE
  // ==========================================

  quiz = signal<QuizWorkspace | null>(null);

  loading = signal(false);
  errorMessage = signal('');

  submitting = signal(false);

  currentQuestionIndex = signal(0);

  submissionError = signal('');

  // Store selected option for each question.
  selectedAnswers = signal<Record<number, number>>({});

  constructor(
    private dailyQuizService: StudentDailyQuizService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  // ==========================================
  // INITIALIZATION
  // ==========================================

  ngOnInit(): void {
    const quizId = Number(
      this.route.snapshot.paramMap.get('quizId')
    );

    if (!Number.isInteger(quizId) || quizId <= 0) {
      this.errorMessage.set('Invalid quiz ID.');
      return;
    }

    this.loadQuestions(quizId);
  }

  // ==========================================
  // LOAD QUESTIONS
  // ==========================================

  loadQuestions(quizId: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.dailyQuizService.getQuestions(quizId).subscribe({

      next: (response) => {
        this.quiz.set(response.quiz);
        this.loading.set(false);
      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message ||
          'Unable to load quiz questions.'
        );

        this.loading.set(false);

        if (error.error?.already_submitted) {
          this.router.navigate(['/daily-quiz']);
        }
      }

    });
  }

  // ==========================================
  // QUESTION NAVIGATION
  // ==========================================

  nextQuestion(): void {
    if (this.currentQuestionIndex() < 2) {
      this.currentQuestionIndex.update(index => index + 1);
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex() > 0) {
      this.currentQuestionIndex.update(index => index - 1);
    }
  }

  // ==========================================
  // SELECT ANSWER
  // ==========================================

  selectAnswer(questionId: number, optionId: number): void {
    this.selectedAnswers.update(answers => ({
      ...answers,
      [questionId]: optionId
    }));
  }

  // ==========================================
  // CURRENT QUESTION
  // ==========================================

  get currentQuestion(): QuizQuestion | null {
    const questions = this.quiz()?.questions || [];

    return questions[this.currentQuestionIndex()] || null;
  }

  // ==========================================
// SUBMIT QUIZ
// ==========================================

submitQuiz(): void {

  const currentQuiz = this.quiz();

  if (!currentQuiz || this.submitting()) {
    return;
  }

  const answers: QuizAnswerSubmission[] =
    currentQuiz.questions.map(question => ({
      question_id: question.question_id,
      selected_option_id:
        this.selectedAnswers()[question.question_id] ?? null
    }));

  const confirmed = window.confirm(
    'Are you sure you want to submit your Daily Quiz? You cannot attempt it again.'
  );

  if (!confirmed) {
    return;
  }

  this.submitting.set(true);
  this.submissionError.set('');

  this.dailyQuizService.submitQuiz(
    currentQuiz.id,
    answers
  ).subscribe({

    next: (response) => {

      this.submitting.set(false);

      this.router.navigate([
        '/daily-quiz',
        currentQuiz.id,
        'result'
      ]);

    },

    error: (error) => {

      this.submitting.set(false);

      this.submissionError.set(
  error.error?.message ||
  'Unable to submit your quiz. Please try again.'
);

    }

  });

}

}
