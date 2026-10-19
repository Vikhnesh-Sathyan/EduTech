
import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  CheatsheetTechnologyService,
  CheatSheetTechnology
} from '../../../../services/admin/cheatsheet/cheatsheet-technology';

import { ToastService } from '../../../../services/toast.service';

import {
  ConfirmModalComponent
} from '../../../../shared/confirm-modal/confirm-modal';

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
export class TechnologyManagementComponent implements OnInit {
  private technologyService = inject(CheatsheetTechnologyService);
  private toastService = inject(ToastService);

  technologies = signal<CheatSheetTechnology[]>([]);
  loading = signal(false);
  saving = signal(false);

  error = signal('');
  message = signal('');

  showForm = signal(false);
  editingTechnologyId = signal<number | null>(null);

  showDeleteModal = signal(false);
  deleting = signal(false);

  selectedTechnology: CheatSheetTechnology | null = null;

  technologyName = '';
  description = '';
  status: 'active' | 'inactive' = 'active';

  ngOnInit(): void {
    this.loadTechnologies();
  }

  loadTechnologies(): void {
    this.loading.set(true);
    this.error.set('');

    this.technologyService.getTechnologies().subscribe({
      next: (response) => {
        this.technologies.set(response.technologies);
        this.loading.set(false);
      },
      error: (err) => {
        this.toastService.error(
          err.error?.message || 'Failed to load technologies.'
        );

        this.loading.set(false);
      }
    });
  }

  openAddForm(): void {
    this.technologyName = '';
    this.description = '';
    this.status = 'active';

    this.editingTechnologyId.set(null);
    this.error.set('');
    this.message.set('');
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingTechnologyId.set(null);
    this.error.set('');
    this.message.set('');
  }

  editTechnology(technology: CheatSheetTechnology): void {
    this.technologyName = technology.name;
    this.description = technology.description || '';
    this.status = technology.status;

    this.editingTechnologyId.set(technology.id);
    this.error.set('');
    this.message.set('');
    this.showForm.set(true);
  }

  saveTechnology(): void {
    const name = this.technologyName.trim();

    if (!name) {
      this.toastService.error('Technology name is required.');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.message.set('');

    const data = {
      name,
      description: this.description.trim(),
      status: this.status
    };

    const editingId = this.editingTechnologyId();

    const request = editingId !== null
      ? this.technologyService.updateTechnology(editingId, data)
      : this.technologyService.addTechnology(data);

    request.subscribe({
      next: (response) => {
        this.toastService.success(
          response.message || 'Technology saved successfully.'
        );

        this.saving.set(false);
        this.showForm.set(false);
        this.editingTechnologyId.set(null);

        this.loadTechnologies();
      },
      error: (err) => {
        this.toastService.error(
          err.error?.message || 'Failed to save technology.'
        );

        this.saving.set(false);
      }
    });
  }

  openDeleteModal(technology: CheatSheetTechnology): void {
    this.selectedTechnology = technology;
    this.showDeleteModal.set(true);
  }

  cancelDelete(): void {
    if (this.deleting()) {
      return;
    }

    this.showDeleteModal.set(false);
    this.selectedTechnology = null;
  }

  deleteTechnology(): void {
    const technology = this.selectedTechnology;

    if (!technology || this.deleting()) {
      return;
    }

    this.deleting.set(true);

    this.technologyService.deleteTechnology(technology.id).subscribe({
      next: (response) => {
        this.toastService.success(
          response.message || 'Technology deleted successfully.'
        );

        this.showDeleteModal.set(false);
        this.selectedTechnology = null;
        this.deleting.set(false);

        this.loadTechnologies();
      },
      error: (err) => {
        this.toastService.error(
          err.error?.message || 'Failed to delete technology.'
        );

        this.showDeleteModal.set(false);
        this.selectedTechnology = null;
        this.deleting.set(false);
      }
    });
  }
}
