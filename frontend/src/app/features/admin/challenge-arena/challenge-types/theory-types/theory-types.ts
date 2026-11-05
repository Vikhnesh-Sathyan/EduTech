import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  TheoryChallengeTypeService
} from '../../../../../services/admin/challenge-arena/theory/theory-challenge-type';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-theory-types',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './theory-types.html',
  styleUrl: './theory-types.css'
})
export class TheoryTypes implements OnInit {

  private typeService = inject(TheoryChallengeTypeService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  loading = signal(false);
  saving = signal(false);

  challengeTypes = signal<any[]>([]);

  showForm = signal(false);

  typeName = '';
  description = '';

  contentSchema: {
    key: string;
    label: string;
    type: string;
    required: boolean;
  }[] = [];

  ngOnInit(): void {
    this.loadTheoryChallengeTypes();
  }

  // LOAD THEORY TYPES
  loadTheoryChallengeTypes(): void {

    this.loading.set(true);

    this.typeService.getTheoryChallengeTypes().subscribe({

      next: (response) => {

        this.challengeTypes.set(response.challengeTypes || []);
        this.loading.set(false);

      },

      error: (err) => {

        this.toastService.error(
          err.error?.message || 'Failed to load theory challenge types.'
        );

        this.loading.set(false);

      }

    });

  }

  // OPEN CREATE FORM
  openCreateForm(): void {

    this.resetForm();
    this.showForm.set(true);

  }

  // RESET FORM
  resetForm(): void {

    this.typeName = '';
    this.description = '';
    this.contentSchema = [];

  }

  // GENERATE TYPE KEY
  generateTypeKey(): string {

    return this.typeName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

  }

  // GENERATE FIELD KEY
  generateFieldKey(field: any): void {

    field.key = field.label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

  }

  // ADD CONTENT FIELD
  addContentField(): void {

    this.contentSchema.push({

      key: '',
      label: '',
      type: 'text',
      required: true

    });

  }

  // REMOVE CONTENT FIELD
  removeContentField(index: number): void {

    this.contentSchema.splice(index, 1);

  }

  // CREATE THEORY CHALLENGE TYPE
  saveChallengeType(): void {

    if (!this.typeName.trim()) {

      this.toastService.error('Please enter challenge type name.');
      return;

    }

    if (this.contentSchema.length === 0) {

      this.toastService.error('Add at least one content field.');
      return;

    }

    for (const field of this.contentSchema) {

      this.generateFieldKey(field);

      if (!field.label.trim() || !field.key) {

        this.toastService.error('Please enter valid field labels.');
        return;

      }

    }

    const data = {

      typeKey: this.generateTypeKey(),
      name: this.typeName.trim(),
      description: this.description.trim(),
      contentSchema: this.contentSchema

    };

    this.saving.set(true);

    this.typeService.createTheoryChallengeType(data).subscribe({

      next: (response) => {

        this.toastService.success(
          response.message || 'Theory challenge type created successfully.'
        );

        this.saving.set(false);

        this.resetForm();
        this.showForm.set(false);

        this.loadTheoryChallengeTypes();

      },

      error: (err) => {

        this.toastService.error(
          err.error?.message || 'Failed to create theory challenge type.'
        );

        this.saving.set(false);

      }

    });

  }

  editChallengeType(typeId: number): void {
  this.router.navigate([
    '/admin/challenge-arena/challenge-types/theory',
    typeId,
    'edit'
  ]);
}

}