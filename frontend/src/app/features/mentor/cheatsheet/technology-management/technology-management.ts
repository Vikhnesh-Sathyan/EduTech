
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  MentorCheatsheetTechnology,
  MentorCheatsheetTechnologyService
} from '../../../../services/mentor/cheatsheet/mentor-cheatsheet-technology';

import { MentorCheatsheetSelectionService } from '../../../../services/mentor/cheatsheet/mentor-cheatsheet-selection';
import { ConfirmModalComponent } from '../../../../shared/confirm-modal/confirm-modal';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-technology-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmModalComponent
  ],
  templateUrl: './technology-management.html',
  styleUrl: './technology-management.css'
})
export class TechnologyManagementComponent {
  private technologyService = inject(
    MentorCheatsheetTechnologyService
  );

  private selectionService = inject(
    MentorCheatsheetSelectionService
  );

  private toast = inject(ToastService);

  technologies = signal<MentorCheatsheetTechnology[]>([]);
  loading = signal(false);
  error = signal('');

  showTechnologyModal = signal(false);
  showDeleteModal = signal(false);
  saving = signal(false);

  technologyName = signal('');
  editingTechnologyId = signal<number | null>(null);
  deletingTechnologyId = signal<number | null>(null);

  selectedTechnologyId = this.selectionService.selectedTechnologyId;

  constructor() {
    this.loadTechnologies();
  }

  loadTechnologies(): void {
    this.loading.set(true);
    this.error.set('');

    this.technologyService.getTechnologies().subscribe({
      next: (response) => {
        const sortedTechnologies = [...response.technologies].sort(
          (a, b) => a.name.localeCompare(b.name)
        );

        this.technologies.set(sortedTechnologies);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err.error?.message || 'Failed to load technologies.'
        );
        this.loading.set(false);
      }
    });
  }

  selectTechnology(technologyId: number): void {
    this.selectionService.selectTechnology(technologyId);
  }

  openAddModal(): void {
    this.editingTechnologyId.set(null);
    this.technologyName.set('');
    this.showTechnologyModal.set(true);
  }

  openEditModal(technology: MentorCheatsheetTechnology): void {
    if (!technology.is_owner) {
      this.toast.error('You can only edit your own technologies.');
      return;
    }

    this.editingTechnologyId.set(technology.id);
    this.technologyName.set(technology.name);
    this.showTechnologyModal.set(true);
  }

  closeTechnologyModal(): void {
    if (this.saving()) {
      return;
    }

    this.showTechnologyModal.set(false);
    this.technologyName.set('');
    this.editingTechnologyId.set(null);
  }

  saveTechnology(): void {
    const name = this.technologyName().trim();

    if (!name) {
      this.toast.error('Please enter a technology name.');
      return;
    }

    if (this.saving()) {
      return;
    }

    this.saving.set(true);

    const technologyId = this.editingTechnologyId();

    const request = technologyId === null
      ? this.technologyService.createTechnology(name)
      : this.technologyService.updateTechnology(technologyId, name);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.showTechnologyModal.set(false);
        this.technologyName.set('');
        this.editingTechnologyId.set(null);

        this.toast.success(
          technologyId === null
            ? 'Technology added successfully.'
            : 'Technology updated successfully.'
        );

        this.loadTechnologies();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(
          err.error?.message || 'Failed to save technology.'
        );
      }
    });
  }

  openDeleteModal(technology: MentorCheatsheetTechnology): void {
    if (!technology.is_owner) {
      this.toast.error('You can only delete your own technologies.');
      return;
    }

    this.deletingTechnologyId.set(technology.id);
    this.showDeleteModal.set(true);
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.deletingTechnologyId.set(null);
  }

  confirmDelete(): void {
    const technologyId = this.deletingTechnologyId();

    if (technologyId === null) {
      return;
    }

    this.technologyService.deleteTechnology(technologyId).subscribe({
      next: () => {
        if (this.selectedTechnologyId() === technologyId) {
          this.selectionService.selectTechnology(0);
        }

        this.showDeleteModal.set(false);
        this.deletingTechnologyId.set(null);

        this.toast.success('Technology deleted successfully.');
        this.loadTechnologies();
      },
      error: (err) => {
        this.showDeleteModal.set(false);
        this.deletingTechnologyId.set(null);

        this.toast.error(
          err.error?.message || 'Failed to delete technology.'
        );
      }
    });
  }
}
