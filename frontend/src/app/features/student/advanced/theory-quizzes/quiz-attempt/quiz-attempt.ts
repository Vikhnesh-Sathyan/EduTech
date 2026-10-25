
import {
  Component,
  OnInit,
  OnDestroy,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentTheoryQuizService } from '../../../../../services/student/advanced/student-theory-quiz.service';

interface QuizOption {
  id: number;
  option_text: string;
}

interface QuizQuestion {
  id: number;
  question_text: string;
  marks: number;
  display_order: number;
  options: QuizOption[];
}



interface SubmitAnswer {
  question_id: number;
  selected_option_id: number | null;
  hint_used?: boolean;
}

type QuizPhase = 'attempt' | 'review' | 'submitted';

@Component({
  selector: 'app-quiz-attempt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-attempt.html',
  styleUrl: './quiz-attempt.css'
})
export class QuizAttempt implements OnInit, OnDestroy {
  loading = signal(true);
  submitting = signal(false);
  error = signal('');
  successMessage = signal('');

  quiz = signal<any>(null);
  questions = signal<QuizQuestion[]>([]);
  attemptId = signal<number | null>(null);
  currentIndex = signal(0);

  answers = signal<Record<number, number>>({});
  markedForReview = signal<number[]>([]);

  phase = signal<QuizPhase>('attempt');
  showSubmitConfirmation = signal(false);
  timeExpired = signal(false);

  durationMinutes = 20;
  remainingSeconds = signal(20 * 60);

  private progressSaveInFlight = false;
  private progressSavePending = false;

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private readonly maxQuestions = 20;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private quizService: StudentTheoryQuizService
  ) {}

  ngOnInit(): void {
    const quizId = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(quizId) || quizId <= 0) {
      this.error.set('Invalid quiz ID.');
      this.loading.set(false);
      return;
    }

    this.loadQuiz(quizId);
  }

  private get quizId(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }


loadQuiz(quizId: number): void {
  this.loading.set(true);
  this.error.set('');
  this.successMessage.set('');

  this.quizService.startOrResumeAttempt(quizId).subscribe({
    next: (response: any) => {
      const quizData = response?.quiz;
      const questionData = response?.questions;
      const attempt = response?.attempt;
      const attemptId = Number(attempt?.id);

      if (!Number.isInteger(attemptId) || attemptId <= 0) {
        this.error.set('Could not start or resume your quiz attempt.');
        this.loading.set(false);
        return;
      }

      if (!quizData || !Array.isArray(questionData)) {
        this.error.set('Quiz data could not be loaded.');
        this.loading.set(false);
        return;
      }

      const validQuestions: QuizQuestion[] = questionData
        .filter((question: any) =>
          Number.isInteger(Number(question.id)) &&
          Array.isArray(question.options)
        )
        .slice(0, this.maxQuestions)
        .map((question: any) => ({
          id: Number(question.id),
          question_text: String(question.question_text ?? ''),
          marks: Number(question.marks) || 0,
          display_order: Number(question.display_order) || 0,
          options: question.options
            .filter((option: any) =>
              Number.isInteger(Number(option.id))
            )
            .map((option: any) => ({
              id: Number(option.id),
              option_text: String(option.option_text ?? '')
            }))
        }));

      if (validQuestions.length === 0) {
        this.error.set('This quiz has no available questions.');
        this.loading.set(false);
        return;
      }

      // Load quiz and questions before handling attempt status.
      this.attemptId.set(attemptId);
      this.quiz.set(quizData);
      this.questions.set(validQuestions);
      this.loading.set(false);

      // Completed attempts must not restart or submit again.
      if (attempt?.status === 'completed') {
        this.stopTimer();
        this.showSubmitConfirmation.set(false);
        this.timeExpired.set(false);
        this.phase.set('submitted');
        this.error.set('');
        this.successMessage.set(
          'This quiz attempt has already been completed.'
        );
        return;
      }

      const configuredDuration = Number(
        quizData.duration_minutes
      );

      this.durationMinutes =
        Number.isFinite(configuredDuration) &&
        configuredDuration > 0
          ? configuredDuration
          : 20;

      this.restoreProgress(
        attemptId,
        validQuestions,
        response?.savedAnswers ?? [],
        Number(attempt?.current_question_index ?? 0)
      );

      const deadlineTime = this.parseDeadline(
        attempt?.deadline_at
      );

      if (!Number.isFinite(deadlineTime)) {
        this.error.set(
          'The quiz deadline could not be loaded. Please try again.'
        );
        return;
      }

      const remaining = Math.max(
        0,
        Math.floor((deadlineTime - Date.now()) / 1000)
      );

      this.remainingSeconds.set(remaining);

      if (remaining === 0) {
        this.timeExpired.set(true);
        this.stopTimer();
        this.phase.set('review');
        this.showSubmitConfirmation.set(false);

        // Automatically submit only an expired in-progress attempt.
        this.confirmSubmit();
        return;
      }

      this.startTimer();
    },

    error: (err) => {
      console.error('Failed to start or resume quiz:', err);

      this.error.set(
        err?.error?.message ||
        'Unable to load this quiz. Please try again.'
      );

      this.loading.set(false);
    }
  });
}


  private parseDeadline(value: unknown): number {
    if (!value) {
      return NaN;
    }

    // MySQL DATETIME values commonly arrive as strings without a timezone.
    // JavaScript interprets a timezone-free ISO datetime as local time.
    const timestamp = new Date(String(value)).getTime();

    return Number.isFinite(timestamp) ? timestamp : NaN;
  }

private restoreProgress(
  attemptId: number,
  questions: QuizQuestion[],
  savedAnswers: any[],
  savedCurrentIndex: number
): void {
  this.currentIndex.set(0);
  this.answers.set({});
  this.markedForReview.set([]);
  this.phase.set('attempt');
  this.showSubmitConfirmation.set(false);
  this.timeExpired.set(false);
  this.submitting.set(false);

  const questionIds = new Set(
    questions.map(question => question.id)
  );

  const validAnswers: Record<number, number> = {};
  const validMarkedIds: number[] = [];

  for (const saved of savedAnswers ?? []) {
    const questionId = Number(saved.question_id);
    const selectedOptionId =
      saved.selected_option_id == null
        ? null
        : Number(saved.selected_option_id);

    const question = questions.find(
      item => item.id === questionId
    );

    if (!question || !questionIds.has(questionId)) {
      continue;
    }

    if (
      selectedOptionId !== null &&
      Number.isInteger(selectedOptionId) &&
      question.options.some(
        option => option.id === selectedOptionId
      )
    ) {
      validAnswers[questionId] = selectedOptionId;
    }

    if (
      saved.marked_for_review === true ||
      Number(saved.marked_for_review) === 1
    ) {
      validMarkedIds.push(questionId);
    }
  }

  const index = Number(savedCurrentIndex);

  this.answers.set(validAnswers);
  this.markedForReview.set([...new Set(validMarkedIds)]);

  this.currentIndex.set(
    Number.isInteger(index) &&
    index >= 0 &&
    index < questions.length
      ? index
      : 0
  );
}

private saveProgress(): void {
  const attemptId = this.attemptId();
  const quizId = this.quizId;

  if (
    !attemptId ||
    !Number.isInteger(quizId) ||
    quizId <= 0 ||
    this.phase() === 'submitted'
  ) {
    return;
  }

  // If a save is already running, request another save afterward.
  if (this.progressSaveInFlight) {
    this.progressSavePending = true;
    return;
  }

  const answersPayload = this.questions().map(question => ({
    question_id: question.id,
    selected_option_id: this.answers()[question.id] ?? null,
    marked_for_review: this.markedForReview().includes(question.id)
  }));

  const currentQuestionIndex = this.currentIndex();

  this.progressSaveInFlight = true;
  this.progressSavePending = false;

  this.quizService
    .saveAttemptProgress(
      quizId,
      attemptId,
      currentQuestionIndex,
      answersPayload
    )
    .subscribe({
      next: () => {
        this.progressSaveInFlight = false;

        if (this.progressSavePending) {
          this.progressSavePending = false;
          this.saveProgress();
          return;
        }

        if (this.phase() === 'review') {
          this.confirmSubmit();
        }
      },
      error: (err) => {
  this.progressSaveInFlight = false;

  console.error(
    'Could not save quiz progress to database:',
    err
  );

  this.error.set(
    err?.error?.message ||
    'Could not save your quiz progress. Please check your connection.'
  );

  // If the timer expired, try submitting using answers already saved
  // in the database. The backend must ignore late client answer changes.
  if (this.phase() === 'review' && this.timeExpired()) {
    this.progressSavePending = false;
    this.confirmSubmit();
  }
}
    });
}

  // Timer
startTimer(): void {
  this.stopTimer();

  if (
    this.phase() !== 'attempt' ||
    this.remainingSeconds() <= 0
  ) {
    return;
  }

  this.timerInterval = setInterval(() => {
    if (this.phase() !== 'attempt') {
      this.stopTimer();
      return;
    }

    if (this.remainingSeconds() <= 1) {
      this.remainingSeconds.set(0);
      this.timeExpired.set(true);
      this.stopTimer();

      // Switch to review mode and hide the confirmation dialog.
      this.phase.set('review');
      this.showSubmitConfirmation.set(false);

      // Save progress. If a save is already running, the pending
      // flag will request another save when it finishes.
      this.saveProgress();

      // Submit only when no progress save is currently running.
      if (!this.progressSaveInFlight) {
        this.confirmSubmit();
      }

      return;
    }

    this.remainingSeconds.update(seconds => seconds - 1);
  }, 1000);
}


  stopTimer(): void {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  get formattedTime(): string {
    const total = this.remainingSeconds();
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  // Answer selection

  selectOption(questionId: number, optionId: number): void {
    if (this.phase() !== 'attempt' || this.submitting()) {
      return;
    }

    const question = this.questions().find(
      item => item.id === questionId
    );

    if (!question?.options.some(option => option.id === optionId)) {
      return;
    }

    this.answers.update(current => ({
      ...current,
      [questionId]: optionId
    }));

    this.saveProgress();
  }

  isSelected(questionId: number, optionId: number): boolean {
    return this.answers()[questionId] === optionId;
  }

  getSelectedOption(questionId: number): QuizOption | undefined {
    const selectedId = this.answers()[questionId];

    return this.questions()
      .find(question => question.id === questionId)
      ?.options.find(option => option.id === selectedId);
  }

  // Review flags

  toggleReview(questionId: number): void {
    if (this.phase() !== 'attempt' || this.submitting()) {
      return;
    }

    this.markedForReview.update(current =>
      current.includes(questionId)
        ? current.filter(id => id !== questionId)
        : [...current, questionId]
    );

    this.saveProgress();
  }

  isMarkedForReview(questionId: number): boolean {
    return this.markedForReview().includes(questionId);
  }

  // Navigation

  nextQuestion(): void {
    if (this.currentIndex() < this.questions().length - 1) {
      this.currentIndex.update(index => index + 1);
      this.saveProgress();
    }
  }

  previousQuestion(): void {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(index => index - 1);
      this.saveProgress();
    }
  }

  goToQuestion(index: number): void {
    if (
      index >= 0 &&
      index < this.questions().length &&
      this.phase() === 'attempt'
    ) {
      this.currentIndex.set(index);
      this.saveProgress();
    }
  }

  // Counts

  get answeredCount(): number {
    return Object.keys(this.answers()).length;
  }

  get unansweredCount(): number {
    return Math.max(
      0,
      this.questions().length - this.answeredCount
    );
  }

  get markedCount(): number {
    return this.markedForReview().length;
  }

  get totalMarks(): number {
    return this.questions().reduce(
      (total, question) =>
        total + (Number(question.marks) || 0),
      0
    );
  }

  get progressPercentage(): number {
    const total = this.questions().length;

    return total
      ? Math.round((this.answeredCount / total) * 100)
      : 0;
  }

  // Final review

  openReview(): void {
    if (this.phase() !== 'attempt') {
      return;
    }

    this.stopTimer();
    this.saveProgress();
    this.showSubmitConfirmation.set(false);
    this.phase.set('review');
  }

  returnToAttempt(): void {
    if (this.timeExpired() || this.submitting()) {
      return;
    }

    this.showSubmitConfirmation.set(false);
    this.phase.set('attempt');
    this.startTimer();
  }

  requestSubmit(): void {
    if (!this.submitting() && this.phase() === 'review') {
      this.showSubmitConfirmation.set(true);
    }
  }

  cancelSubmit(): void {
    if (!this.submitting()) {
      this.showSubmitConfirmation.set(false);
    }
  }

  confirmSubmit(): void {
  if (this.submitting() || this.phase() !== 'review') {
    return;
  }

  if (this.progressSaveInFlight) {
    return;
  }

  const quizId = this.quizId;
  const attemptId = this.attemptId();

  if (
    !Number.isInteger(quizId) ||
    quizId <= 0 ||
    !attemptId
  ) {
    this.error.set(
      'The quiz attempt could not be identified. Please reload the quiz.'
    );
    this.showSubmitConfirmation.set(false);
    return;
  }

  const answersPayload: SubmitAnswer[] = this.questions().map(
    question => ({
      question_id: question.id,
      selected_option_id: this.answers()[question.id] ?? null
    })
  );

  this.submitting.set(true);
  this.error.set('');
  this.successMessage.set('');
  this.showSubmitConfirmation.set(false);

  this.quizService
  .submitAttempt(
    quizId,
    attemptId,
    answersPayload,
    this.timeExpired()
  )
    .subscribe({
      next: (response: any) => {
        this.submitting.set(false);
        this.stopTimer();
        this.phase.set('submitted');

        const result = response?.result ?? response;
        const score = Number(result?.score);
        const totalMarks = Number(result?.total_marks);
        const percentage = Number(result?.percentage);

        if (
          Number.isFinite(score) &&
          Number.isFinite(totalMarks)
        ) {
          this.successMessage.set(
            `Quiz submitted successfully. Score: ${score} / ${totalMarks}` +
            (Number.isFinite(percentage)
              ? ` (${percentage}%).`
              : '.')
          );
        } else {
          this.successMessage.set(
            'Quiz submitted successfully. Your result has been saved.'
          );
        }
      },

    error: (err) => {
  console.error('Quiz submission failed:', err);
  this.submitting.set(false);

  this.error.set(
    err?.error?.message ||
    'Could not submit your quiz. Please try again.'
  );

  // Keep the quiz in review mode so submission can be retried.
  // Do not restart the timer after it has expired.
  if (this.timeExpired()) {
    this.phase.set('review');
    this.showSubmitConfirmation.set(false);
  }
}
    });
}

  ngOnDestroy(): void {
    this.saveProgress();
    this.stopTimer();
  }
}
