
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { AdminCareerQuestions } from '../../../../../services/admin/career-hub/admin-career-questions';

interface QuestionCategory {
  id: number;
  category_name: string;
  description?: string | null;
  is_active?: number | boolean | string;
  created_at?: string;
}

interface CareerQuestion {
  id: number;
  category_id: number;
  category_name: string;
  question_text: string;
  answer_text: string | null;
  explanation: string | null;
  contributor_name: string;
  contributor_role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './questions.html',
  styleUrl: './questions.css'
})
export class Questions implements OnInit {

  private service = inject(AdminCareerQuestions);
  private fb = inject(FormBuilder);

  // ==========================================
  // DATA
  // ==========================================

  questions = signal<CareerQuestion[]>([]);

  // All categories for category management
  categories = signal<QuestionCategory[]>([]);

  // Active categories for question dropdown
  activeCategories = signal<QuestionCategory[]>([]);

  // ==========================================
  // GENERAL STATES
  // ==========================================

  loading = signal(false);
  submitting = signal(false);

  showForm = signal(false);
  editingId = signal<number | null>(null);

  activeTab = signal<'questions' | 'categories'>('questions');

  successMessage = signal('');
  errorMessage = signal('');

  // ==========================================
  // CATEGORY STATES
  // ==========================================

  categoryLoading = signal(false);
  categorySubmitting = signal(false);

  showCategoryForm = signal(false);
  editingCategoryId = signal<number | null>(null);

  // ==========================================
  // QUESTION FORM
  // ==========================================

  questionForm = this.fb.group({
    category_id: ['', Validators.required],

    question_text: ['', [
      Validators.required,
      Validators.maxLength(5000)
    ]],

    answer_text: [''],
    explanation: ['']
  });

  // ==========================================
  // CATEGORY FORM
  // ==========================================

  categoryForm = this.fb.group({
    category_name: ['', [
      Validators.required,
      Validators.maxLength(100)
    ]],

    description: ['']
  });

  // ==========================================
  // INITIALIZATION
  // ==========================================

  ngOnInit(): void {
    this.loadFormData();
    this.loadQuestions();
    this.loadCategories();
  }

  // ==========================================
  // TAB MANAGEMENT
  // ==========================================

  setTab(tab: 'questions' | 'categories'): void {
    this.activeTab.set(tab);

    this.successMessage.set('');
    this.errorMessage.set('');

    if (tab === 'questions') {
      this.loadFormData();
    } else {
      this.loadCategories();
    }
  }

  // ==========================================
  // LOAD ACTIVE QUESTION CATEGORIES
  // ==========================================

  loadFormData(): void {

    this.service.getQuestionFormData().subscribe({

      next: (response) => {
        this.activeCategories.set(response.data || []);
      },

      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(
          error.error?.message || 'Failed to load question categories.'
        );
      }

    });

  }

  // ==========================================
  // LOAD QUESTIONS
  // ==========================================

  loadQuestions(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.service.getQuestions().subscribe({

      next: (response) => {
        this.questions.set(response.data || []);
        this.loading.set(false);
      },

      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(
          error.error?.message || 'Failed to load career questions.'
        );

        this.loading.set(false);
      }

    });

  }

  // ==========================================
  // CREATE QUESTION
  // ==========================================

  openCreateForm(): void {

    this.editingId.set(null);

    this.questionForm.reset({
      category_id: '',
      question_text: '',
      answer_text: '',
      explanation: ''
    });

    this.successMessage.set('');
    this.errorMessage.set('');

    this.showForm.set(true);

  }

  // ==========================================
  // EDIT QUESTION
  // ==========================================

  editQuestion(question: CareerQuestion): void {

    this.editingId.set(question.id);

    this.questionForm.patchValue({
      category_id: String(question.category_id),
      question_text: question.question_text,
      answer_text: question.answer_text || '',
      explanation: question.explanation || ''
    });

    this.successMessage.set('');
    this.errorMessage.set('');

    this.showForm.set(true);

  }

  // ==========================================
  // CLOSE QUESTION FORM
  // ==========================================

  closeForm(): void {

    this.showForm.set(false);
    this.editingId.set(null);
    this.questionForm.reset();

  }

  // ==========================================
  // SAVE QUESTION
  // ==========================================

  submitQuestion(): void {

    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      return;
    }

    const formValue = this.questionForm.getRawValue();

    const data = {
      category_id: Number(formValue.category_id),
      question_text: formValue.question_text?.trim() || '',
      answer_text: formValue.answer_text?.trim() || null,
      explanation: formValue.explanation?.trim() || null
    };

    this.submitting.set(true);
    this.errorMessage.set('');

    const editingId = this.editingId();

    const request = editingId
      ? this.service.updateQuestion(editingId, data)
      : this.service.createQuestion(data);

    request.subscribe({

      next: (response) => {

        this.successMessage.set(
          response.message || 'Career question saved successfully.'
        );

        this.submitting.set(false);

        this.closeForm();
        this.loadQuestions();

      },

      error: (error: HttpErrorResponse) => {

        this.errorMessage.set(
          error.error?.message || 'Failed to save career question.'
        );

        this.submitting.set(false);

      }

    });

  }

  // ==========================================
  // ARCHIVE QUESTION
  // ==========================================

  archiveQuestion(id: number): void {

    const confirmed = window.confirm(
      'Are you sure you want to archive this career question?'
    );

    if (!confirmed) {
      return;
    }

    this.service.archiveQuestion(id).subscribe({

      next: (response) => {

        this.successMessage.set(
          response.message || 'Career question archived successfully.'
        );

        this.loadQuestions();

      },

      error: (error: HttpErrorResponse) => {

        this.errorMessage.set(
          error.error?.message || 'Failed to archive career question.'
        );

      }

    });

  }

  // ==========================================
  // LOAD ALL QUESTION CATEGORIES
  // ==========================================

  loadCategories(): void {

    this.categoryLoading.set(true);

    this.service.getQuestionCategories().subscribe({

      next: (response) => {

        this.categories.set(response.data || []);
        this.categoryLoading.set(false);

      },

      error: (error: HttpErrorResponse) => {

        this.errorMessage.set(
          error.error?.message || 'Failed to load question categories.'
        );

        this.categoryLoading.set(false);

      }

    });

  }

  // ==========================================
  // CREATE CATEGORY FORM
  // ==========================================

  openCreateCategoryForm(): void {

    this.editingCategoryId.set(null);

    this.categoryForm.reset({
      category_name: '',
      description: ''
    });

    this.successMessage.set('');
    this.errorMessage.set('');

    this.showCategoryForm.set(true);

  }

  // ==========================================
  // EDIT CATEGORY
  // ==========================================

  editCategory(category: QuestionCategory): void {

    this.editingCategoryId.set(category.id);

    this.categoryForm.patchValue({
      category_name: category.category_name,
      description: category.description || ''
    });

    this.successMessage.set('');
    this.errorMessage.set('');

    this.showCategoryForm.set(true);

  }

  // ==========================================
  // CLOSE CATEGORY FORM
  // ==========================================

  closeCategoryForm(): void {

    this.showCategoryForm.set(false);
    this.editingCategoryId.set(null);
    this.categoryForm.reset();

  }

  // ==========================================
  // SAVE CATEGORY
  // ==========================================

  submitCategory(): void {

    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const formValue = this.categoryForm.getRawValue();

    const data = {
      category_name: formValue.category_name?.trim() || '',
      description: formValue.description?.trim() || ''
    };

    this.categorySubmitting.set(true);
    this.errorMessage.set('');

    const editingId = this.editingCategoryId();

    const request = editingId
      ? this.service.updateQuestionCategory(editingId, data)
      : this.service.createQuestionCategory(data);

    request.subscribe({

      next: (response) => {

        this.successMessage.set(
          response.message || 'Question category saved successfully.'
        );

        this.categorySubmitting.set(false);

        this.closeCategoryForm();

        this.loadCategories();
        this.loadFormData();

      },

      error: (error: HttpErrorResponse) => {

        this.errorMessage.set(
          error.error?.message || 'Failed to save question category.'
        );

        this.categorySubmitting.set(false);

      }

    });

  }

  // ==========================================
  // CHECK CATEGORY STATUS
  // ==========================================

  isCategoryActive(category: QuestionCategory): boolean {

    return Number(category.is_active) === 1;

  }

  // ==========================================
  // ACTIVATE / DEACTIVATE CATEGORY
  // ==========================================

  toggleCategoryStatus(category: QuestionCategory): void {

    const action = this.isCategoryActive(category)
      ? 'deactivate'
      : 'activate';

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this category?`
    );

    if (!confirmed) {
      return;
    }

    this.service.toggleQuestionCategoryStatus(category.id).subscribe({

      next: (response) => {

        this.successMessage.set(
          response.message || `Category ${action}d successfully.`
        );

        this.loadCategories();
        this.loadFormData();

      },

      error: (error: HttpErrorResponse) => {

        this.errorMessage.set(
          error.error?.message || 'Failed to update category status.'
        );

      }

    });

  }

}
