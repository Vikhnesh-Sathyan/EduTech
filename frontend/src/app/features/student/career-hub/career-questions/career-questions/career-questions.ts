
import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { StudentCareerQuestionsService } from '../../../../../services/student/career-hub/student-career-questions.service';

interface CareerQuestionCategory {
  id: number;
  category_name: string;
}

interface CareerQuestion {
  id: number;
  category_id: number;
  category_name: string;
  question_text: string;
  answer_text: string | null;
  explanation: string | null;
  created_by: number;
  status: string;
  created_at: string;
  contributor_name: string;
}

@Component({
  selector: 'app-student-career-questions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe
  ],
  templateUrl: './career-questions.html',
  styleUrl: './career-questions.css'
})
export class CareerQuestions implements OnInit {

  private fb = inject(FormBuilder);

  private careerQuestionsService =
    inject(StudentCareerQuestionsService);

  // ==========================================
  // SIGNALS
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
  // FORM
  // ==========================================

  questionForm = this.fb.group({
    category_id: ['', Validators.required],

    question_text: [
      '',
      [
        Validators.required,
        Validators.maxLength(5000)
      ]
    ],

    answer_text: [
      '',
      Validators.maxLength(10000)
    ],

    explanation: [
      '',
      Validators.maxLength(10000)
    ]
  });

  // ==========================================
  // INITIALIZATION
  // ==========================================

  ngOnInit(): void {
    this.loadFormData();
    this.loadQuestions();
  }

  // ==========================================
  // LOAD FORM DATA
  // ==========================================

  loadFormData(): void {

    this.formLoading.set(true);

    this.careerQuestionsService.getQuestionFormData()
      .subscribe({

        next: (response) => {

          this.categories.set(response.categories || []);

          this.formLoading.set(false);
        },

        error: (error) => {

          this.errorMessage.set(
            error.error?.message ||
            'Failed to load question categories'
          );

          this.formLoading.set(false);
        }

      });
  }

  // ==========================================
  // LOAD QUESTIONS
  // ==========================================

  loadQuestions(): void {

    this.loading.set(true);

    this.careerQuestionsService.getCareerQuestions()
      .subscribe({

        next: (response) => {

          this.questions.set(response.questions || []);

          this.loading.set(false);
        },

        error: (error) => {

          this.errorMessage.set(
            error.error?.message ||
            'Failed to load career questions'
          );

          this.loading.set(false);
        }

      });
  }

  // ==========================================
  // SUBMIT QUESTION
  // ==========================================

  submitQuestion(): void {

    this.successMessage.set('');
    this.errorMessage.set('');

    if (this.questionForm.invalid) {

      this.questionForm.markAllAsTouched();

      return;
    }

    this.submitting.set(true);

    const formValue = this.questionForm.getRawValue();

    const payload = {
      category_id: Number(formValue.category_id),

      question_text: formValue.question_text!.trim(),

      answer_text: formValue.answer_text?.trim() || '',

      explanation: formValue.explanation?.trim() || ''
    };

    this.careerQuestionsService
      .submitCareerQuestion(payload)
      .subscribe({

        next: (response) => {

          this.successMessage.set(
            response.message ||
            'Career question shared successfully'
          );

          this.questionForm.reset({
            category_id: '',
            question_text: '',
            answer_text: '',
            explanation: ''
          });

          this.loadQuestions();

          this.submitting.set(false);
        },

        error: (error) => {

          this.errorMessage.set(
            error.error?.message ||
            'Failed to share career question'
          );

          this.submitting.set(false);
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
