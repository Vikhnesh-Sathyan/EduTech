
import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  AdminDailyQuiz,
  DailyQuizQuestion,
  QuestionBankResponse
} from '../../../../services/admin/daily-quiz/admin-daily-quiz.service';

import {
  AdminSubject
} from '../../../../services/admin/admin-subjects';

@Component({
  selector: 'app-question-bank',
  imports: [FormsModule],
  templateUrl: './question-bank.html',
  styleUrl: './question-bank.css',
})
export class QuestionBank implements OnInit {

  // ==========================================
  // COMPONENT STATE
  // ==========================================

  subjects = signal<any[]>([]);

  questions = signal<DailyQuizQuestion[]>([]);

  selectedSubjectId = signal<number | null>(null);

  loadingSubjects = signal(false);

  loadingQuestions = signal(false);

  errorMessage = signal('');

  editingQuestion = signal<DailyQuizQuestion | null>(null);

  savingQuestion = signal(false);


  // ==========================================
  // QUESTION STATISTICS
  // ==========================================

  totalQuestions = computed(
    () => this.questions().length
  );

  activeCount = computed(
    () => this.questions().filter(
      question => question.status === 'active'
    ).length
  );

  archivedCount = computed(
    () => this.questions().filter(
      question => question.status === 'archived'
    ).length
  );

  usedCount = computed(
    () => this.questions().filter(
      question => question.is_used
    ).length
  );


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private dailyQuizService: AdminDailyQuiz,
    private subjectService: AdminSubject
  ) {}


  // ==========================================
  // INITIALIZATION
  // ==========================================

  ngOnInit(): void {
    this.loadSubjects();
  }


  // ==========================================
  // LOAD SUBJECTS
  // ==========================================

  loadSubjects(): void {

    this.loadingSubjects.set(true);

    this.errorMessage.set('');

    this.subjectService.getSubjects().subscribe({

      next: (response: any) => {

        this.subjects.set(
          response.data || response.subjects || response
        );

        this.loadingSubjects.set(false);

      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message || 'Failed to load subjects'
        );

        this.loadingSubjects.set(false);

      }

    });

  }


  // ==========================================
  // LOAD QUESTION BANK
  // ==========================================

  loadQuestions(): void {

    const subjectId = this.selectedSubjectId();

    if (!subjectId) {

      this.questions.set([]);

      return;

    }

    this.loadingQuestions.set(true);

    this.errorMessage.set('');

    this.dailyQuizService
      .getQuestions(subjectId)
      .subscribe({

        next: (response: QuestionBankResponse) => {

          this.questions.set(response.data);

          this.loadingQuestions.set(false);

        },

        error: (error) => {

          this.errorMessage.set(
            error.error?.message || 'Failed to load questions'
          );

          this.loadingQuestions.set(false);

        }

      });

  }


  // ==========================================
  // SUBJECT SELECTION
  // ==========================================

  onSubjectChange(subjectId: number | null): void {

    this.selectedSubjectId.set(subjectId);

    this.questions.set([]);

    this.editingQuestion.set(null);

    this.loadQuestions();

  }


  // ==========================================
  // START EDITING QUESTION
  // ==========================================

  editQuestion(question: DailyQuizQuestion): void {

    if (!question.can_edit) {
      return;
    }

    this.editingQuestion.set({

      ...question,

      options: question.options.map(option => ({
        ...option
      }))

    });

  }


  // ==========================================
  // CANCEL EDITING
  // ==========================================

  cancelEdit(): void {

    this.editingQuestion.set(null);

  }


  // ==========================================
  // ARCHIVE QUESTION
  // ==========================================

  archiveQuestion(question: DailyQuizQuestion): void {

    if (!question.can_archive) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to archive this question?'
    );

    if (!confirmed) {
      return;
    }

    this.dailyQuizService
      .archiveQuestion(question.question_id)
      .subscribe({

        next: () => {

          this.loadQuestions();

        },

        error: (error) => {

          this.errorMessage.set(
            error.error?.message || 'Failed to archive question'
          );

        }

      });

  }


  // ==========================================
  // RESTORE QUESTION
  // ==========================================

  restoreQuestion(question: DailyQuizQuestion): void {

    if (!question.can_restore) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to restore this question?'
    );

    if (!confirmed) {
      return;
    }

    this.dailyQuizService
      .restoreQuestion(question.question_id)
      .subscribe({

        next: () => {

          this.loadQuestions();

        },

        error: (error) => {

          this.errorMessage.set(
            error.error?.message || 'Failed to restore question'
          );

        }

      });

  }

  // UPDATE QUESTION TEXT
updateEditingQuestionText(value: string): void {

  const question = this.editingQuestion();

  if (!question) return;

  this.editingQuestion.set({
    ...question,
    question_text: value
  });

}


// UPDATE OPTION TEXT
updateEditingOptionText(index: number, value: string): void {

  const question = this.editingQuestion();

  if (!question) return;

  const updatedOptions = question.options.map((option, i) =>
    i === index
      ? { ...option, option_text: value }
      : option
  );

  this.editingQuestion.set({
    ...question,
    options: updatedOptions
  });

}


// SELECT CORRECT ANSWER
setCorrectOption(index: number): void {

  const question = this.editingQuestion();

  if (!question) return;

  const updatedOptions = question.options.map((option, i) => ({
    ...option,
    is_correct: i === index
  }));

  this.editingQuestion.set({
    ...question,
    options: updatedOptions
  });

}


// SAVE QUESTION
saveQuestion(): void {

  const question = this.editingQuestion();

  if (!question || this.savingQuestion()) return;

  const questionText = question.question_text.trim();

  if (!questionText) {
    this.errorMessage.set('Question text is required');
    return;
  }

  if (question.options.length !== 3) {
    this.errorMessage.set('Exactly three options are required');
    return;
  }

  const normalizedOptions = question.options.map(option => ({
    option_text: option.option_text.trim(),
    is_correct: option.is_correct
  }));

  if (normalizedOptions.some(option => !option.option_text)) {
    this.errorMessage.set('All three options are required');
    return;
  }

  const uniqueOptions = new Set(
    normalizedOptions.map(option =>
      option.option_text.toLowerCase()
    )
  );

  if (uniqueOptions.size !== 3) {
    this.errorMessage.set('All three options must be unique');
    return;
  }

  const correctCount = normalizedOptions.filter(
    option => option.is_correct
  ).length;

  if (correctCount !== 1) {
    this.errorMessage.set('Select exactly one correct answer');
    return;
  }

  this.errorMessage.set('');
  this.savingQuestion.set(true);

  this.dailyQuizService.updateQuestion(
    question.question_id,
    {
      question_text: questionText,
      options: normalizedOptions
    }
  ).subscribe({

    next: () => {

      this.editingQuestion.set(null);
      this.savingQuestion.set(false);

      this.loadQuestions();

    },

    error: (error) => {

      this.errorMessage.set(
        error.error?.message || 'Failed to update question'
      );

      this.savingQuestion.set(false);

    }

  });

}

}
