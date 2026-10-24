import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, signal } from '@angular/core';

import { ConfirmModalComponent } from '../../../../shared/confirm-modal/confirm-modal';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AdvancedTheoryQuizService } from '../../../../services/mentor/advanced/advanced-theory-quiz.service';
import { ToastService } from '../../../../services/toast.service';

type QuizDifficulty = 'beginner' | 'intermediate' | 'advanced';


interface TheoryQuizOption {
  id?: number;
  option_text: string;
  is_correct: boolean | number;
  display_order: number;
}

interface TheoryQuizQuestion {
  id: number;
  question_text: string;
  explanation: string | null;
  concept_tag: string | null;
  marks: number;
  display_order: number;
  options: TheoryQuizOption[];
}

@Component({
  selector: 'app-theory-quiz-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    ConfirmModalComponent
  ],
  templateUrl: './theory-quiz-edit.html',
  styleUrl: './theory-quiz-edit.css'
})

export class TheoryQuizEdit implements OnInit {
  loading = signal(true);
  saving = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  private quizId = 0;
  private topicId: number | null = null;
  private subtopicId: number | null = null;

  questions: TheoryQuizQuestion[] = [];
  questionsLoading = false;
  questionsSaving = false;
  questionError = '';

  quizStatus: 'draft' | 'published' | 'inactive' = 'draft';
  publishing = false;
 
  deletingQuestionId: number | null = null;
  questionToDelete: TheoryQuizQuestion | null = null;

  addingQuestion = false;
  newQuestion: TheoryQuizQuestion | null = null;

  form!: FormGroup<{
    title: FormControl<string>;
    description: FormControl<string>;
    difficulty: FormControl<QuizDifficulty>;
    pass_percentage: FormControl<number>;
  }>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private quizService: AdvancedTheoryQuizService,
    private toastService: ToastService
  ) {
    this.form = this.fb.nonNullable.group({
      title: [
        '',
        [Validators.required, Validators.maxLength(200)]
      ],
      description: [''],
      difficulty: [
        'beginner' as QuizDifficulty,
        Validators.required
      ],
      pass_percentage: [
        60,
        [
          Validators.required,
          Validators.min(0),
          Validators.max(100)
        ]
      ]
    });
  }

  ngOnInit(): void {
    
    this.quizId = Number(
      this.route.snapshot.paramMap.get('quizId')
    );

    if (!Number.isInteger(this.quizId) || this.quizId <= 0) {
      this.errorMessage.set('Invalid quiz ID.');
      this.loading.set(false);
      return;
    }

    this.loadQuiz();
  }
loadQuiz(): void {
  this.loading.set(true);
  this.errorMessage.set('');

  this.quizService.getMyQuizById(this.quizId).subscribe({
    next: (response: any) => {
      const quiz = response.quiz;
      this.quizStatus = quiz.status;
      // Preserve existing topic assignments
      this.topicId = quiz.topic_id;
      this.subtopicId = quiz.subtopic_id;

      // Load quiz details into the form
      this.form.patchValue({
        title: quiz.title,
        description: quiz.description ?? '',
        difficulty: quiz.difficulty,
        pass_percentage: Number(quiz.pass_percentage)
      });

      // Load questions and options
      const questionList =
        response.questions ?? quiz.questions ?? [];

      this.questions = questionList.map(
        (question: any): TheoryQuizQuestion => ({
          id: Number(question.id),
          question_text: question.question_text ?? '',
          explanation: question.explanation ?? null,
          concept_tag: question.concept_tag ?? null,
          marks: Number(question.marks ?? 1),
          display_order: Number(question.display_order ?? 1),

          options: (question.options ?? []).map(
            (option: any): TheoryQuizOption => ({
              id: Number(option.id),
              option_text: option.option_text ?? '',
              is_correct: Number(option.is_correct) === 1,
              display_order: Number(option.display_order ?? 1)
            })
          )
        })
      );

      this.loading.set(false);
    },

    error: (error) => {
      console.error('Failed to load quiz for editing:', error);

      this.errorMessage.set(
        error.error?.message || 'Unable to load this quiz.'
      );

      this.loading.set(false);
    }
  });
}

  saveChanges(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.saving()) {
      return;
    }

    const values = this.form.getRawValue();

    this.saving.set(true);

    this.quizService.updateQuiz(this.quizId, {
      title: values.title.trim(),
      description: values.description.trim() || null,
      topic_id: this.topicId,
      subtopic_id: this.subtopicId,
      difficulty: values.difficulty,
      pass_percentage: Number(values.pass_percentage)
    }).subscribe({
      next: () => {
        this.saving.set(false);

        this.router.navigate([
          '/mentor/advanced/theory-quizzes',
          this.quizId,
          'view'
        ]);
      },
      error: error => {
        console.error('Failed to update quiz:', error);

        this.errorMessage.set(
          error.error?.message || 'Unable to update quiz details.'
        );

        this.saving.set(false);
      }
    });
  }

  addOption(question: TheoryQuizQuestion): void {
  question.options.push({
    option_text: '',
    is_correct: false,
    display_order: question.options.length + 1
  });
}

removeOption(
  question: TheoryQuizQuestion,
  optionIndex: number
): void {
  // Existing options may be referenced by student answers.
  // Don't remove saved options until the backend safely
  // handles option removal and answer history.
  const option = question.options[optionIndex];

  if (option?.id) {
    this.questionError =
      'Saved options cannot be removed yet. You can edit their text.';
    return;
  }

  question.options.splice(optionIndex, 1);

  question.options.forEach((item, index) => {
    item.display_order = index + 1;
  });
}

setCorrectOption(
  question: TheoryQuizQuestion,
  selectedIndex: number
): void {
  question.options.forEach((option, index) => {
    option.is_correct = index === selectedIndex;
  });
}

saveQuestion(question: TheoryQuizQuestion): void {
  this.questionError = '';
  this.successMessage.set('');

  if (!question.question_text.trim()) {
    this.questionError = 'Question text is required.';
    return;
  }

  if (!Number.isFinite(Number(question.marks)) ||
      Number(question.marks) <= 0) {
    this.questionError = 'Marks must be greater than zero.';
    return;
  }

  if (question.options.length < 2) {
    this.questionError = 'Add at least two options.';
    return;
  }

  if (question.options.some(option => !option.option_text.trim())) {
    this.questionError = 'Please fill in every option.';
    return;
  }

  const correctCount = question.options.filter(
    option => option.is_correct === true ||
              Number(option.is_correct) === 1
  ).length;

  if (correctCount !== 1) {
    this.questionError = 'Select exactly one correct answer.';
    return;
  }

  if (this.questionsSaving) {
    return;
  }

  this.questionsSaving = true;

  // Save the question fields first.
  this.quizService.updateQuizQuestions(this.quizId, [
    {
      id: question.id,
      question_text: question.question_text.trim(),
      explanation: question.explanation?.trim() || null,
      concept_tag: question.concept_tag?.trim() || null,
      marks: Number(question.marks),
      display_order: question.display_order
    }
  ]).subscribe({
    next: () => {
      // Then save all existing options and any new options.
      this.quizService.updateQuestionOptions(
        this.quizId,
        question.id,
        question.options.map((option, index) => ({
          ...(option.id ? { id: option.id } : {}),
          option_text: option.option_text.trim(),
          is_correct: Boolean(
            option.is_correct === true ||
            Number(option.is_correct) === 1
          ),
          display_order: index + 1
        }))
      ).subscribe({
        next: () => {
          this.questionsSaving = false;
          this.questionError = '';
          this.successMessage.set(
            `Question ${question.display_order} saved successfully.`
          );
        },
        error: error => {
          console.error('Failed to save options:', error);

          this.questionsSaving = false;
          this.questionError =
            error.error?.message ||
            'Question was saved, but its options could not be saved.';
        }
      });
    },
    error: error => {
      console.error('Failed to save question:', error);

      this.questionsSaving = false;
      this.questionError =
        error.error?.message || 'Failed to save question.';
    }
  });
}

publishQuiz(): void {
  if (this.publishing || this.quizStatus !== 'draft') {
    return;
  }

  if (!window.confirm('Publish this quiz? Students may access it once it is available through the student-side APIs.')) {
    return;
  }

  this.publishing = true;

  this.quizService.publishQuiz(this.quizId).subscribe({
    next: (response) => {
      this.quizStatus = 'published';

      // Show the common success toast after the server confirms publishing.
      this.toastService.success(
        response?.message || 'Quiz published successfully!'
      );

      this.publishing = false;
    },

    error: (error) => {
      console.error('Failed to publish quiz:', error);

      // Show errors through the shared toast system.
      this.toastService.error(
        error.error?.message || 'Unable to publish this quiz.'
      );

      this.publishing = false;
    }
  });
}

 isCorrect(option: TheoryQuizOption): boolean {
  return option.is_correct === true ||
    Number(option.is_correct) === 1;
}



requestDeleteQuestion(question: TheoryQuizQuestion): void {
  if (this.questionsSaving || this.questionsLoading ||
      this.deletingQuestionId !== null) {
    return;
  }

  this.questionToDelete = question;
}

cancelDeleteQuestion(): void {
  this.questionToDelete = null;
}


confirmDeleteQuestion(): void {
  const question = this.questionToDelete;

  if (!question || this.deletingQuestionId !== null) {
    return;
  }

  this.deletingQuestionId = question.id;
  this.questionError = '';

  this.quizService.deleteQuestion(
    this.quizId,
    question.id
  ).subscribe({
    next: (response) => {
      this.questions = this.questions
        .filter(item => item.id !== question.id)
        .map((item, index) => ({
          ...item,
          display_order: index + 1
        }));

      // Close the modal after successful deletion
      this.questionToDelete = null;
      this.deletingQuestionId = null;

      this.toastService.success(
        response.message || 'Question deleted successfully.'
      );
    },

    error: (error) => {
      this.deletingQuestionId = null;

      this.toastService.error(
        error.error?.message || 'Unable to delete this question.'
      );
    }
  });
}

addNewQuestion(): void {
  this.questionError = '';
  this.successMessage.set('');

  if (this.newQuestion) {
    this.questionError = 'Finish or cancel the current new question first.';
    return;
  }

  this.newQuestion = {
    id: 0,
    question_text: '',
    explanation: '',
    concept_tag: '',
    marks: 1,
    display_order: this.questions.length + 1,
    options: [
      { option_text: '', is_correct: true, display_order: 1 },
      { option_text: '', is_correct: false, display_order: 2 }
    ]
  };
}

cancelNewQuestion(): void {
  if (this.addingQuestion) return;

  this.newQuestion = null;
  this.questionError = '';
}

saveNewQuestion(): void {
  const question = this.newQuestion;

  if (!question || this.addingQuestion) return;

  this.questionError = '';

  const normalizedText = (value: string) =>
    value.trim().replace(/\s+/g, ' ').toLowerCase();

  if (!question.question_text.trim()) {
    this.questionError = 'Question text is required.';
    return;
  }

  const duplicate = this.questions.some(
    existing =>
      normalizedText(existing.question_text) ===
      normalizedText(question.question_text)
  );

  if (duplicate) {
    this.questionError = 'This question already exists in the quiz.';
    return;
  }

  if (!Number.isFinite(Number(question.marks)) ||
      Number(question.marks) <= 0) {
    this.questionError = 'Marks must be greater than zero.';
    return;
  }

  if (question.options.length < 2) {
    this.questionError = 'Add at least two options.';
    return;
  }

  if (question.options.some(option => !option.option_text.trim())) {
    this.questionError = 'Please fill in every option.';
    return;
  }

  const correctCount = question.options.filter(
    option => option.is_correct === true ||
              Number(option.is_correct) === 1
  ).length;

  if (correctCount !== 1) {
    this.questionError = 'Select exactly one correct answer.';
    return;
  }

  this.addingQuestion = true;

  this.quizService.addQuestion(this.quizId, {
    question_text: question.question_text.trim(),
    explanation: question.explanation?.trim() || null,
    concept_tag: question.concept_tag?.trim() || null,
    marks: Number(question.marks),
    options: question.options.map((option, index) => ({
      option_text: option.option_text.trim(),
      is_correct: Boolean(
        option.is_correct === true ||
        Number(option.is_correct) === 1
      ),
      display_order: index + 1
    }))
  }).subscribe({
    next: response => {
      this.addingQuestion = false;
      this.newQuestion = null;

      this.toastService.success(
        response.message || 'Question added successfully.'
      );

      this.loadQuiz();
    },
    error: error => {
      this.addingQuestion = false;

      this.questionError =
        error.error?.message || 'Unable to add question.';
    }
  });
}


}
