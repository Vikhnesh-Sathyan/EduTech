
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  CodingChallengeType,
  CodingChallengeTypeService
} from '../../../../../services/admin/challenge-arena/coding/coding-challenge-type';

import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-coding-types',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './coding-types.html',
  styleUrl: './coding-types.css'
})
export class CodingTypesComponent implements OnInit {

  private challengeTypeService = inject(CodingChallengeTypeService);
  private toastService = inject(ToastService);
  private router = inject(Router);


  loading = signal(false);
  saving = signal(false);

  challengeTypes = signal<CodingChallengeType[]>([]);

  showForm = signal(false);

  typeKey = '';
  typeName = '';
  description = '';

  contentSchema: {
  key: string;
  label: string;
  type: string;
  required: boolean;
  }[] = [];

  ngOnInit(): void {
    this.loadCodingChallengeTypes();
  }

  loadCodingChallengeTypes(): void {
    this.loading.set(true);

    this.challengeTypeService.getCodingChallengeTypes().subscribe({
      next: (response) => {
        this.challengeTypes.set(response.challengeTypes);
        this.loading.set(false);
      },

      error: (err) => {
        this.toastService.error(
          err.error?.message ||
          'Failed to load coding challenge types.'
        );

        this.loading.set(false);
      }
    });
  }

  openCreateForm(): void {
  this.resetForm();
  this.showForm.set(true);
}

resetForm(): void {
  this.typeKey = '';
  this.typeName = '';
  this.description = '';
  this.contentSchema = [];
}

addContentField(): void {
  this.contentSchema.push({
    key: '',
    label: '',
    type: 'text',
    required: true
  });

  this.contentSchema = [...this.contentSchema];
}
removeContentField(index: number): void {
  this.contentSchema.splice(index, 1);

  this.contentSchema = [...this.contentSchema];
}

generateTypeKey(): void {
  this.typeKey = this.typeName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

generateFieldKey(field: any): void {

  field.key = field.label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

}

saveChallengeType(): void {

  if (!this.typeName.trim()) {
    this.toastService.error('Please enter challenge type name.');
    return;
  }

  if (!this.typeKey.trim()) {
    this.toastService.error('Invalid challenge type name.');
    return;
  }

  if (this.contentSchema.length === 0) {
    this.toastService.error('Please add at least one content field.');
    return;
  }

  this.saving.set(true);

  const data = {
    typeKey: this.typeKey,
    name: this.typeName.trim(),
    description: this.description.trim(),
    contentSchema: this.contentSchema
  };

  this.challengeTypeService.createCodingChallengeType(data).subscribe({

    next: (response) => {

      this.toastService.success(
        response.message || 'Challenge type created successfully.'
      );

      this.saving.set(false);
      this.showForm.set(false);
      this.resetForm();
      this.loadCodingChallengeTypes();

    },

    error: (err) => {

      this.toastService.error(
        err.error?.message || 'Failed to create challenge type.'
      );

      this.saving.set(false);

    }

  });

}

editChallengeType(typeId: number): void {
  this.router.navigate([
    '/admin/challenge-arena/challenge-types/coding',
    typeId,
    'edit'
  ]);
}

}
