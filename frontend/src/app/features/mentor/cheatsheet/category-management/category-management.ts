
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  MentorCheatsheetCategory,
  MentorCheatsheetCategoryService
} from '../../../../services/mentor/cheatsheet/mentor-cheatsheet-category';

import {
  MentorCheatsheetTechnology,
  MentorCheatsheetTechnologyService
} from '../../../../services/mentor/cheatsheet/mentor-cheatsheet-technology';

import { MentorCheatsheetSelectionService } from '../../../../services/mentor/cheatsheet/mentor-cheatsheet-selection';

import { ToastService } from '../../../../services/toast.service';
import { ConfirmModalComponent } from '../../../../shared/confirm-modal/confirm-modal';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmModalComponent
  ],
  templateUrl: './category-management.html',
  styleUrl: './category-management.css'
})
export class CategoryManagementComponent {

  private categoryService = inject(
    MentorCheatsheetCategoryService
  );

  private technologyService = inject(
    MentorCheatsheetTechnologyService
  );

  private selectionService = inject(
    MentorCheatsheetSelectionService
  );

  private toast = inject(ToastService);

  technologies = signal<MentorCheatsheetTechnology[]>([]);
  categories = signal<MentorCheatsheetCategory[]>([]);

  selectedTechnologyId = this.selectionService.selectedTechnologyId;

  loadingTechnologies = signal(false);
  loadingCategories = signal(false);
  saving = signal(false);
  deleting = signal(false);

  error = signal('');

  showDeleteModal = signal(false);
  deletingCategory = signal<MentorCheatsheetCategory | null>(null);

  categoryName = '';
  displayOrder = 1;

  editingCategoryId = signal<number | null>(null);

  constructor() {
    this.loadTechnologies();
  }

  loadTechnologies(): void {
    this.loadingTechnologies.set(true);
    this.error.set('');

    this.technologyService.getTechnologies().subscribe({
      next: (response) => {
        this.technologies.set(response.technologies);
        this.loadingTechnologies.set(false);

        const selectedId = this.selectedTechnologyId();

        if (
          selectedId !== null &&
          response.technologies.some(
            technology => technology.id === selectedId
          )
        ) {
          this.loadCategories();
        } else {
          this.categories.set([]);
          this.loadingCategories.set(false);
        }
      },
      error: (err) => {
        this.error.set(
          err.error?.message || 'Failed to load technologies.'
        );
        this.toast.error(this.error());
        this.loadingTechnologies.set(false);
      }
    });
  }

  selectTechnology(technologyId: number): void {
    this.selectionService.selectTechnology(technologyId);

    this.categories.set([]);
    this.error.set('');
    this.resetForm();

    this.loadCategories();
  }

  loadCategories(): void {
    const technologyId = this.selectedTechnologyId();

    if (technologyId === null) {
      this.categories.set([]);
      this.loadingCategories.set(false);
      return;
    }

    this.loadingCategories.set(true);
    this.error.set('');

    this.categoryService.getCategories(technologyId).subscribe({
      next: (response) => {
        this.categories.set(response.categories);
        this.loadingCategories.set(false);
      },
      error: (err) => {
        this.categories.set([]);
        this.error.set(
          err.error?.message || 'Failed to load categories.'
        );
        this.toast.error(this.error());
        this.loadingCategories.set(false);
      }
    });
  }

  saveCategory(): void {
    const technologyId = this.selectedTechnologyId();
    const name = this.categoryName.trim();

    if (technologyId === null) {
      this.toast.error('Please select a technology.');
      return;
    }

    if (!name) {
      this.toast.error('Category name is required.');
      return;
    }

    if (
      !Number.isInteger(this.displayOrder) ||
      this.displayOrder < 1
    ) {
      this.toast.error(
        'Display order must be a positive integer.'
      );
      return;
    }

    if (this.saving()) {
      return;
    }

    this.saving.set(true);
    this.error.set('');

    const data = {
      name,
      display_order: this.displayOrder
    };

    const isEditing = this.editingCategoryId() !== null;

    const request = isEditing
      ? this.categoryService.updateCategory(
          this.editingCategoryId()!,
          data
        )
      : this.categoryService.createCategory(
          technologyId,
          data
        );

    request.subscribe({
      next: (response) => {
        this.saving.set(false);

        this.toast.success(
          response.message ||
          (isEditing
            ? 'Category updated successfully.'
            : 'Category created successfully.')
        );

        this.resetForm();
        this.loadCategories();
      },
      error: (err) => {
        this.saving.set(false);

        this.toast.error(
          err.error?.message || 'Failed to save category.'
        );
      }
    });
  }

  editCategory(category: MentorCheatsheetCategory): void {
    this.editingCategoryId.set(category.id);
    this.categoryName = category.name;
    this.displayOrder = category.display_order;
    this.error.set('');
  }

  deleteCategory(category: MentorCheatsheetCategory): void {
    if (this.deleting()) {
      return;
    }

    this.deletingCategory.set(category);
    this.showDeleteModal.set(true);
  }

  confirmDelete(): void {
    const category = this.deletingCategory();

    if (!category || this.deleting()) {
      return;
    }

    this.deleting.set(true);
    this.error.set('');

    this.categoryService.deleteCategory(category.id).subscribe({
      next: (response) => {
        this.deleting.set(false);
        this.showDeleteModal.set(false);
        this.deletingCategory.set(null);

        this.toast.success(
          response.message || 'Category deleted successfully.'
        );

        if (this.editingCategoryId() === category.id) {
          this.resetForm();
        }

        this.loadCategories();
      },
      error: (err) => {
        this.deleting.set(false);
        this.showDeleteModal.set(false);
        this.deletingCategory.set(null);

        this.toast.error(
          err.error?.message || 'Failed to delete category.'
        );
      }
    });
  }

  cancelDelete(): void {
    if (this.deleting()) {
      return;
    }

    this.showDeleteModal.set(false);
    this.deletingCategory.set(null);
  }

  resetForm(): void {
    this.categoryName = '';
    this.displayOrder = 1;
    this.editingCategoryId.set(null);
  }
}
