
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  CheatsheetTechnologyService,
  CheatSheetTechnology
} from '../../../../services/admin/cheatsheet/cheatsheet-technology';

import {
  CheatsheetCategoryService,
  CheatSheetCategory
} from '../../../../services/admin/cheatsheet/cheatsheet-category';

import { ToastService } from '../../../../services/toast.service';
import { ConfirmModalComponent } from '../../../../shared/confirm-modal/confirm-modal';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './category-management.html',
  styleUrl: './category-management.css'
})
export class CategoryManagementComponent implements OnInit {
  private technologyService = inject(CheatsheetTechnologyService);
  private categoryService = inject(CheatsheetCategoryService);
  private toastService = inject(ToastService);

  technologies = signal<CheatSheetTechnology[]>([]);
  categories = signal<CheatSheetCategory[]>([]);

  selectedTechnologyId = signal<number | null>(null);

  loadingTechnologies = signal(false);
  loadingCategories = signal(false);
  saving = signal(false);
  deleting = signal(false);

  showForm = signal(false);
  editingCategoryId = signal<number | null>(null);

  showDeleteModal = signal(false);
  selectedCategory: CheatSheetCategory | null = null;

  categoryName = '';
  displayOrder = 1;

  ngOnInit(): void {
    this.loadTechnologies();
  }

  loadTechnologies(): void {
    this.loadingTechnologies.set(true);

    this.technologyService.getTechnologies().subscribe({
      next: (response) => {
        this.technologies.set(
          response.technologies.filter(
            technology => technology.status === 'active'
          )
        );
        this.loadingTechnologies.set(false);
      },
      error: (err) => {
        this.toastService.error(
          err.error?.message || 'Failed to load technologies.'
        );
        this.loadingTechnologies.set(false);
      }
    });
  }

  selectTechnology(value: string | number): void {
    const id = Number(value);

    if (!Number.isInteger(id) || id <= 0) {
      this.selectedTechnologyId.set(null);
      this.categories.set([]);
      this.cancelForm();
      return;
    }

    this.selectedTechnologyId.set(id);
    this.categories.set([]);
    this.cancelForm();
    this.loadCategories();
  }

  loadCategories(): void {
    const technologyId = this.selectedTechnologyId();

    if (technologyId === null) {
      this.categories.set([]);
      return;
    }

    this.loadingCategories.set(true);

    this.categoryService.getCategories(technologyId).subscribe({
      next: (response) => {
        this.categories.set(response.categories);
        this.loadingCategories.set(false);
      },
      error: (err) => {
        this.toastService.error(
          err.error?.message || 'Failed to load categories.'
        );
        this.loadingCategories.set(false);
      }
    });
  }

  openAddForm(): void {
    if (this.selectedTechnologyId() === null) {
      this.toastService.error('Please select a technology first.');
      return;
    }

    this.categoryName = '';
    this.displayOrder = this.categories().length + 1;
    this.editingCategoryId.set(null);
    this.showForm.set(true);
  }

  editCategory(category: CheatSheetCategory): void {
    this.categoryName = category.name;
    this.displayOrder = category.display_order;
    this.editingCategoryId.set(category.id);
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingCategoryId.set(null);
    this.categoryName = '';
    this.displayOrder = 1;
  }

  saveCategory(): void {
    const name = this.categoryName.trim();
    const technologyId = this.selectedTechnologyId();
    const editingId = this.editingCategoryId();

    if (technologyId === null) {
      this.toastService.error('Please select a technology first.');
      return;
    }

    if (!name) {
      this.toastService.error('Category name is required.');
      return;
    }

    if (
      !Number.isInteger(Number(this.displayOrder)) ||
      Number(this.displayOrder) < 1
    ) {
      this.toastService.error(
        'Display order must be a positive whole number.'
      );
      return;
    }

    const data = {
      name,
      display_order: Number(this.displayOrder)
    };

    this.saving.set(true);

    const request = editingId !== null
      ? this.categoryService.updateCategory(editingId, data)
      : this.categoryService.addCategory(technologyId, data);

    request.subscribe({
      next: (response) => {
        this.toastService.success(
          response.message || 'Category saved successfully.'
        );

        this.saving.set(false);
        this.cancelForm();
        this.loadCategories();
      },
      error: (err) => {
        this.toastService.error(
          err.error?.message || 'Failed to save category.'
        );
        this.saving.set(false);
      }
    });
  }

  openDeleteModal(category: CheatSheetCategory): void {
    this.selectedCategory = category;
    this.showDeleteModal.set(true);
  }

  cancelDelete(): void {
    if (this.deleting()) return;

    this.showDeleteModal.set(false);
    this.selectedCategory = null;
  }

  deleteCategory(): void {
    const category = this.selectedCategory;

    if (!category || this.deleting()) return;

    this.deleting.set(true);

    this.categoryService.deleteCategory(category.id).subscribe({
      next: (response) => {
        this.toastService.success(
          response.message || 'Category deleted successfully.'
        );

        this.showDeleteModal.set(false);
        this.selectedCategory = null;
        this.deleting.set(false);
        this.loadCategories();
      },
      error: (err) => {
        this.toastService.error(
          err.error?.message ||
          'Failed to delete category. It may contain topics.'
        );

        this.showDeleteModal.set(false);
        this.selectedCategory = null;
        this.deleting.set(false);
      }
    });
  }
}
