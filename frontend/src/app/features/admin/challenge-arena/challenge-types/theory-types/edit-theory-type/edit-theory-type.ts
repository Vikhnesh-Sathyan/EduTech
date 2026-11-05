
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  TheoryChallengeTypeService
} from '../../../../../../services/admin/challenge-arena/theory/theory-challenge-type';

import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-edit-theory-type',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-theory-type.html',
  styleUrl: './edit-theory-type.css'
})
export class EditTheoryType implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private typeService = inject(TheoryChallengeTypeService);
  private toastService = inject(ToastService);

  loading = signal(false);
  saving = signal(false);

  typeId = 0;

  typeName = '';
  description = '';

  contentSchema: {
    key: string;
    label: string;
    type: string;
    required: boolean;
  }[] = [];

  ngOnInit(): void {
    this.typeId = Number(this.route.snapshot.paramMap.get('typeId'));

    if (!this.typeId || Number.isNaN(this.typeId)) {
      this.toastService.error('Invalid challenge type ID.');
      this.goBack();
      return;
    }

    this.loadChallengeType();
  }

  // LOAD SELECTED THEORY CHALLENGE TYPE
  loadChallengeType(): void {

    this.loading.set(true);

    this.typeService.getTheoryChallengeTypes().subscribe({

      next: (response) => {

        const selectedType = response.challengeTypes.find(
          type => type.id === this.typeId
        );

        if (!selectedType) {
          this.toastService.error('Theory challenge type not found.');
          this.loading.set(false);
          this.goBack();
          return;
        }

        this.typeName = selectedType.name;
        this.description = selectedType.description || '';

        try {

          const schema = typeof selectedType.content_schema === 'string'
            ? JSON.parse(selectedType.content_schema)
            : selectedType.content_schema;

          this.contentSchema = Array.isArray(schema)
            ? schema.map((field: any) => ({
                key: field.key || '',
                label: field.label || '',
                type: field.type || 'text',
                required: field.required ?? true
              }))
            : [];

        } catch {

          this.toastService.error('Unable to read challenge content fields.');
          this.contentSchema = [];

        }

        this.loading.set(false);
      },

      error: (err) => {

        this.toastService.error(
          err.error?.message || 'Failed to load challenge type.'
        );

        this.loading.set(false);

      }

    });

  }

  // GENERATE FIELD KEY AUTOMATICALLY
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

  // SAVE UPDATED THEORY CHALLENGE TYPE
  updateChallengeType(): void {

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

    // CHECK FOR DUPLICATE FIELD KEYS
    const fieldKeys = this.contentSchema.map(field => field.key);

    if (new Set(fieldKeys).size !== fieldKeys.length) {
      this.toastService.error('Content field labels must be unique.');
      return;
    }

    const data = {
      name: this.typeName.trim(),
      description: this.description.trim(),
      contentSchema: this.contentSchema
    };

    this.saving.set(true);

    this.typeService.updateTheoryChallengeType(
      this.typeId,
      data
    ).subscribe({

      next: (response) => {

        this.toastService.success(
          response.message || 'Theory challenge type updated successfully.'
        );

        this.saving.set(false);
        this.goBack();

      },

      error: (err) => {

        this.toastService.error(
          err.error?.message || 'Failed to update theory challenge type.'
        );

        this.saving.set(false);

      }

    });

  }

  // RETURN TO THEORY TYPES PAGE
  goBack(): void {
    this.router.navigate([
      '/admin/challenge-arena/challenge-types/theory'
    ]);
  }

}
