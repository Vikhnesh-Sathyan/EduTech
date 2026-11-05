
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  CodingChallengeType,
  CodingChallengeTypeService
} from '../../../../../../services/admin/challenge-arena/coding/coding-challenge-type';

import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-edit-coding-type',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './edit-coding-type.html',
  styleUrl: './edit-coding-type.css'
})
export class EditCodingTypeComponent implements OnInit {

  private typeService = inject(CodingChallengeTypeService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

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

    this.typeId = Number(
      this.route.snapshot.paramMap.get('typeId')
    );

    if (!this.typeId || isNaN(this.typeId)) {
      this.toastService.error('Invalid challenge type ID.');
      this.goBack();
      return;
    }

    this.loadChallengeType();
  }

  // ==========================================
  // LOAD CHALLENGE TYPE
  // ==========================================

  loadChallengeType(): void {

    this.loading.set(true);

    this.typeService.getCodingChallengeTypes().subscribe({

      next: (response) => {

        const selectedType = response.challengeTypes.find(
          type => type.id === this.typeId
        );

        if (!selectedType) {
          this.toastService.error('Challenge type not found.');
          this.loading.set(false);
          this.goBack();
          return;
        }

        this.typeName = selectedType.name;
        this.description = selectedType.description || '';

        const schema = selectedType.content_schema;

        this.contentSchema = typeof schema === 'string'
          ? JSON.parse(schema)
          : schema;

        this.loading.set(false);
      },

      error: (err) => {

        this.toastService.error(
          err.error?.message ||
          'Failed to load challenge type.'
        );

        this.loading.set(false);
      }

    });
  }

  // ==========================================
  // GENERATE FIELD KEY AUTOMATICALLY
  // ==========================================

  generateFieldKey(field: any): void {

    field.key = field.label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  // ==========================================
  // ADD CONTENT FIELD
  // ==========================================

  addContentField(): void {

    this.contentSchema.push({
      key: '',
      label: '',
      type: 'text',
      required: true
    });

    this.contentSchema = [...this.contentSchema];
  }

  // ==========================================
  // REMOVE CONTENT FIELD
  // ==========================================

  removeContentField(index: number): void {

    this.contentSchema.splice(index, 1);

    this.contentSchema = [...this.contentSchema];
  }

  // ==========================================
  // UPDATE CHALLENGE TYPE
  // ==========================================

  saveChanges(): void {

    if (!this.typeName.trim()) {
      this.toastService.error('Please enter challenge type name.');
      return;
    }

    if (this.contentSchema.length === 0) {
      this.toastService.error('At least one content field is required.');
      return;
    }

    for (const field of this.contentSchema) {

      this.generateFieldKey(field);

      if (!field.label.trim()) {
        this.toastService.error('Please enter all field labels.');
        return;
      }

      if (!field.key) {
        this.toastService.error('Invalid field label.');
        return;
      }
    }

    this.saving.set(true);

    const data = {
      name: this.typeName.trim(),
      description: this.description.trim(),
      contentSchema: this.contentSchema
    };

    this.typeService.updateCodingChallengeType(
      this.typeId,
      data
    ).subscribe({

      next: (response) => {

        this.toastService.success(
          response.message ||
          'Challenge type updated successfully.'
        );

        this.saving.set(false);

        this.goBack();
      },

      error: (err) => {

        this.toastService.error(
          err.error?.message ||
          'Failed to update challenge type.'
        );

        this.saving.set(false);
      }

    });
  }

  // ==========================================
  // BACK TO CODING TYPES
  // ==========================================

  goBack(): void {

    this.router.navigate([
      '/admin/challenge-arena/challenge-types/coding'
    ]);
  }

}
