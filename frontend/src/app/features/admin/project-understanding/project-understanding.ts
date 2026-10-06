import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AdminProjectService } from '../../../services/admin-project.service';

@Component({
  selector: 'app-project-understanding',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule
  ],
  templateUrl: './project-understanding.html',
  styleUrl: './project-understanding.css'
})
export class ProjectUnderstanding implements OnInit {

  // =====================================================
  // CATEGORIES
  // =====================================================

  // Store project categories loaded from the backend
  categories = signal<any[]>([]);


  // =====================================================
  // ADD CATEGORY
  // =====================================================

  // Control Add Category form visibility
  showAddForm = false;

  // New category form data
  newCategory = {
    name: '',
    description: '',
    display_order: 1
  };


  // =====================================================
  // EDIT CATEGORY
  // =====================================================

  // Store the category currently being edited
  editingCategoryId: number | null = null;

  // Edit category form data
  editCategory = {
    name: '',
    description: '',
    display_order: 1,
    status: 'active'
  };


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private adminProjectService: AdminProjectService
  ) {}


  // =====================================================
  // INITIALIZE PAGE
  // =====================================================

  ngOnInit(): void {

    this.loadCategories();

  }


  // =====================================================
  // LOAD CATEGORIES
  // =====================================================

  // Load project categories from the backend
  loadCategories(): void {

    this.adminProjectService
      .getCategories()
      .subscribe({

        next: (response: any) => {

          const categories = Array.isArray(response)
            ? response
            : response.categories || [];

          this.categories.set(categories);

        },

        error: (error) => {

          console.error(
            'Failed to load project categories:',
            error
          );

        }

      });

  }


  // =====================================================
  // CREATE CATEGORY
  // =====================================================

  // Create a new project category
  createCategory(): void {

    // Validate required fields
    if (
      !this.newCategory.name.trim() ||
      !this.newCategory.display_order
    ) {
      return;
    }

    this.adminProjectService
      .createCategory(this.newCategory)
      .subscribe({

        next: () => {

          // Close the form
          this.showAddForm = false;

          // Reset form
          this.newCategory = {
            name: '',
            description: '',
            display_order: 1
          };

          // Reload categories from database
          this.loadCategories();

        },

        error: (error) => {

          console.error(
            'Failed to create project category:',
            error
          );

        }

      });

  }


  // =====================================================
  // START EDIT
  // =====================================================

  // Load category data into the edit form
  startEditCategory(category: any): void {

    this.editingCategoryId = category.id;

    this.editCategory = {
      name: category.name,
      description: category.description || '',
      display_order: category.display_order,
      status: category.status || 'active'
    };

  }


  // =====================================================
  // CANCEL EDIT
  // =====================================================

  // Close the edit form
  cancelEditCategory(): void {

    this.editingCategoryId = null;

    this.editCategory = {
      name: '',
      description: '',
      display_order: 1,
      status: 'active'
    };

  }


  // =====================================================
  // UPDATE CATEGORY
  // =====================================================

  // Update an existing project category
  updateCategory(): void {

    if (
      !this.editingCategoryId ||
      !this.editCategory.name.trim() ||
      !this.editCategory.display_order
    ) {
      return;
    }

    this.adminProjectService
      .updateCategory(
        this.editingCategoryId,
        this.editCategory
      )
      .subscribe({

        next: () => {

          this.cancelEditCategory();

          // Reload updated categories
          this.loadCategories();

        },

        error: (error) => {

          console.error(
            'Failed to update project category:',
            error
          );

        }

      });

  }


  // =====================================================
  // DELETE CATEGORY
  // =====================================================

  // Delete a project category
  deleteCategory(categoryId: number): void {

    const confirmed = confirm(
      'Are you sure you want to delete this category?'
    );

    if (!confirmed) {
      return;
    }

    this.adminProjectService
      .deleteCategory(categoryId)
      .subscribe({

        next: () => {

          // Reload categories after deletion
          this.loadCategories();

        },

        error: (error) => {

          console.error(
            'Failed to delete project category:',
            error
          );

        }

      });

  }

}