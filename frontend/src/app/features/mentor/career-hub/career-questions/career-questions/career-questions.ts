
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  MentorCareerQuestionsService,
  CareerQuestionCategory,
  CareerQuestion
} from '../../../../../services/mentor/career-hub/mentor-career-questions.service';

@Component({
  selector: 'app-mentor-career-questions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './career-questions.html',
  styleUrl: './career-questions.css'
})
export class CareerQuestions implements OnInit {

  private fb = inject(FormBuilder);
  private questionService = inject(MentorCareerQuestionsService);

  // ==========================================
  // STATE
  // ==========================================

  categories = signal<CareerQuestionCategory[]>([]);
  questions = signal<CareerQuestion[]>([]);

  loading = signal(false);
  formLoading = signal(false);
  submitting = signal(false);

  successMessage = signal('');
  errorMessage = signal('');

  selectedQuestion = signal<CareerQuestion | null>(null);

  // ==========================================
  // QUESTION FORM
  // ==========================================

  questionForm = this.fb.group({
    category_id: ['', Validators.required],

    question_text: [
      '',
      [Validators.required, Validators.maxLength(5000)]
    ],

    answer_text: [''],

    explanation: ['']
  });

  // ==========================================
  // INITIALIZE
  // ==========================================

  ngOnInit(): void {
    this.loadFormData();
    this.loadQuestions();
  }

  // ==========================================
  // LOAD CATEGORY FORM DATA
  // ==========================================

  loadFormData(): void {

    this.formLoading.set(true);

    this.questionService.getQuestionFormData().subscribe({

      next: (response) => {

        if (response.success) {
          this.categories.set(response.data || []);
        }

        this.formLoading.set(false);

      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message || 'Failed to load question categories'
        );

        this.formLoading.set(false);

      }

    });

  }

  // ==========================================
  // LOAD CAREER QUESTIONS
  // ==========================================

  loadQuestions(): void {

    this.loading.set(true);

    this.questionService.getCareerQuestions().subscribe({

      next: (response) => {

        if (response.success) {
          this.questions.set(response.data || []);
        }

        this.loading.set(false);

      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message || 'Failed to load career questions'
        );

        this.loading.set(false);

      }

    });

  }

  // ==========================================
  // SUBMIT CAREER QUESTION
  // ==========================================

  submitQuestion(): void {

    this.successMessage.set('');
    this.errorMessage.set('');

    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      return;
    }

    const formValue = this.questionForm.getRawValue();

    const questionText = formValue.question_text?.trim() || '';

    if (!questionText) {
      this.errorMessage.set('Please enter your question.');
      return;
    }

    this.submitting.set(true);

    this.questionService.submitCareerQuestion({

      category_id: Number(formValue.category_id),

      question_text: questionText,

      answer_text: formValue.answer_text?.trim() || null,

      explanation: formValue.explanation?.trim() || null

    }).subscribe({

      next: (response) => {

        this.submitting.set(false);

        if (response.success) {

          this.successMessage.set(
            response.message || 'Career question published successfully'
          );

          this.questionForm.reset({
            category_id: '',
            question_text: '',
            answer_text: '',
            explanation: ''
          });

          this.loadQuestions();

        } else {

          this.errorMessage.set(
            response.message || 'Failed to submit career question'
          );

        }

      },

      error: (error) => {

        this.submitting.set(false);

        this.errorMessage.set(
          error.error?.message || 'Failed to submit career question'
        );

      }

    });

  }

  // ==========================================
  // VIEW QUESTION DETAILS
  // ==========================================

  viewQuestion(question: CareerQuestion): void {
    this.selectedQuestion.set(question);
  }

  // ==========================================
  // CLOSE QUESTION DETAILS
  // ==========================================

  closeQuestionDetails(): void {
    this.selectedQuestion.set(null);
  }

}
