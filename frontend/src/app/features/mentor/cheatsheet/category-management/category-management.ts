
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

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
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

  private selectionService = inject(MentorCheatsheetSelectionService);

  technologies = signal<MentorCheatsheetTechnology[]>([]);
  categories = signal<MentorCheatsheetCategory[]>([]);

  selectedTechnologyId = this.selectionService.selectedTechnologyId;

  loadingTechnologies = signal(false);
  loadingCategories = signal(false);
  saving = signal(false);

  message = signal('');
  error = signal('');

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
      }
    },
    error: (err) => {
      this.error.set(
        err.error?.message || 'Failed to load technologies.'
      );
      this.loadingTechnologies.set(false);
    }
  });
}


  selectTechnology(technologyId: number): void {
  this.selectionService.selectTechnology(technologyId);
  this.categories.set([]);
  this.message.set('');
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
      this.loadingCategories.set(false);
    }
  });
}


  saveCategory(): void {
    const technologyId = this.selectedTechnologyId();
    const name = this.categoryName.trim();

    if (technologyId === null) {
      this.error.set('Please select a technology.');
      return;
    }

    if (!name) {
      this.error.set('Category name is required.');
      return;
    }

    if (!Number.isInteger(this.displayOrder) || this.displayOrder < 1) {
      this.error.set('Display order must be a positive integer.');
      return;
    }

    this.saving.set(true);
    this.message.set('');
    this.error.set('');

    const data = {
      name,
      display_order: this.displayOrder
    };

    const request = this.editingCategoryId() !== null
      ? this.categoryService.updateCategory(
          this.editingCategoryId()!,
          data
        )
      : this.categoryService.createCategory(technologyId, data);

    request.subscribe({
      next: (response) => {
        this.message.set(response.message);
        this.saving.set(false);
        this.resetForm();
        this.loadCategories();
      },
      error: (err) => {
        this.error.set(
          err.error?.message || 'Failed to save category.'
        );
        this.saving.set(false);
      }
    });
  }

  editCategory(category: MentorCheatsheetCategory): void {
    this.editingCategoryId.set(category.id);
    this.categoryName = category.name;
    this.displayOrder = category.display_order;
    this.message.set('');
    this.error.set('');
  }

  deleteCategory(category: MentorCheatsheetCategory): void {
    const confirmed = confirm(
      `Delete the category "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.error.set('');
    this.message.set('');

    this.categoryService.deleteCategory(category.id).subscribe({
      next: (response) => {
        this.message.set(response.message);
        this.loadCategories();
      },
      error: (err) => {
        this.error.set(
          err.error?.message || 'Failed to delete category.'
        );
      }
    });
  }

  resetForm(): void {
    this.categoryName = '';
    this.displayOrder = 1;
    this.editingCategoryId.set(null);
  }
}
