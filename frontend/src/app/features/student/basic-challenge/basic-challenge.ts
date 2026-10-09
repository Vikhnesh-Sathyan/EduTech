
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { StudentBasicChallengeService } from '../../../services/student-basic-challenge.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-basic-challenge',
  standalone: true,
  imports: [],
  templateUrl: './basic-challenge.html',
  styleUrl: './basic-challenge.css'
})
export class BasicChallenge implements OnInit {

  subtopicId!: number;

  questions = signal<any[]>([]);
  currentIndex = signal(0);

  // Preserve each question's answer and confidence.
  answers = signal<Record<number, string>>({});
  confidenceLevels = signal<Record<number, string>>({});

  loading = signal(false);
  submitting = signal(false);

  // Stores the result returned by the backend.
  result = signal<any | null>(null);

  constructor(
    private route: ActivatedRoute,
    private challengeService: StudentBasicChallengeService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('subtopicId');

    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
      this.toastService.error(
        'Valid subtopic information is required.'
      );
      return;
    }

    this.subtopicId = Number(id);
    this.loadQuestions();
  }

  // ======================================================
  // LOAD QUESTIONS
  // ======================================================

  loadQuestions(): void {
    this.loading.set(true);

    this.challengeService.getQuestions(this.subtopicId).subscribe({
      next: (response: any) => {
        const loadedQuestions = response.questions || [];

        this.questions.set(loadedQuestions);
        this.currentIndex.set(0);
        this.answers.set({});
        this.confidenceLevels.set({});
        this.result.set(null);
        this.loading.set(false);

        if (loadedQuestions.length !== 5) {
          this.toastService.error(
            'The challenge must contain exactly 5 questions.'
          );
        }
      },
      error: (error) => {
        this.loading.set(false);

        this.toastService.error(
          error.error?.message ||
          'Failed to load challenge questions.'
        );
      }
    });
  }

  // ======================================================
  // SELECT ANSWER
  // ======================================================

  selectAnswer(answer: string): void {
    const question = this.questions()[this.currentIndex()];

    if (!question) return;

    this.answers.update(current => ({
      ...current,
      [question.id]: answer
    }));
  }

  // ======================================================
  // SELECT CONFIDENCE
  // ======================================================

  selectConfidence(level: string): void {
    const question = this.questions()[this.currentIndex()];

    if (!question) return;

    this.confidenceLevels.update(current => ({
      ...current,
      [question.id]: level
    }));
  }

  // ======================================================
  // GET CURRENT QUESTION'S SAVED ANSWER
  // ======================================================

  selectedAnswer(): string | null {
    const question = this.questions()[this.currentIndex()];

    return question
      ? this.answers()[question.id] || null
      : null;
  }

  // ======================================================
  // GET CURRENT QUESTION'S SAVED CONFIDENCE
  // ======================================================

  confidence(): string | null {
    const question = this.questions()[this.currentIndex()];

    return question
      ? this.confidenceLevels()[question.id] || null
      : null;
  }

  // ======================================================
  // NEXT QUESTION
  // ======================================================

  nextQuestion(): void {
    if (!this.validateCurrentQuestion()) return;

    if (this.currentIndex() < this.questions().length - 1) {
      this.currentIndex.update(index => index + 1);
    }
  }

  // ======================================================
  // PREVIOUS QUESTION
  // ======================================================

  previousQuestion(): void {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(index => index - 1);
    }
  }

  // ======================================================
  // VALIDATE CURRENT QUESTION
  // ======================================================

  private validateCurrentQuestion(): boolean {
    if (!this.selectedAnswer()) {
      this.toastService.error('Please select an answer.');
      return false;
    }

    if (!this.confidence()) {
      this.toastService.error(
        'Please select your confidence level.'
      );
      return false;
    }

    return true;
  }

  // ======================================================
  // SUBMIT CHALLENGE
  // ======================================================

  submitChallenge(): void {
    if (this.submitting() || this.result()) {
      return;
    }

    if (this.questions().length !== 5) {
      this.toastService.error(
        'The five challenge questions are not ready.'
      );
      return;
    }

    const missingIndex = this.questions().findIndex(question =>
      !this.answers()[question.id] ||
      !this.confidenceLevels()[question.id]
    );

    if (missingIndex !== -1) {
      this.currentIndex.set(missingIndex);

      this.toastService.error(
        'Answer all five questions and select your confidence level.'
      );

      return;
    }

    const submissionAnswers = this.questions().map(question => ({
      questionId: Number(question.id),
      selectedAnswer: this.answers()[question.id],
      confidence: this.confidenceLevels()[question.id]
    }));

    this.submitting.set(true);

    this.challengeService
      .submitChallenge(this.subtopicId, submissionAnswers)
      .subscribe({
        next: (response: any) => {
          console.log('CHALLENGE RESULT:', response);
          this.result.set(response);
          this.submitting.set(false);

          if (response.passed) {
            this.toastService.success(
              'Congratulations! You passed the Basic Challenge.'
            );
          } else {
            this.toastService.info(
              `You scored ${response.score}/20. Review your weak areas before trying again.`
            );
          }
        },
        error: (error) => {
          this.submitting.set(false);

          this.toastService.error(
            error.error?.message ||
            'Failed to submit the challenge. Please try again.'
          );
        }
      });
  }

  // ======================================================
  // OPEN ADVANCED LEARNING
  // ======================================================

  openAdvancedLearning(): void {
    this.router.navigate([
      '/advanced-learning',
      this.subtopicId
    ]);
  }
}