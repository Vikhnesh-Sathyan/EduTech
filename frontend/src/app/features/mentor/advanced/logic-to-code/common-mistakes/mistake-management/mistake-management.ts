
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  LogicToCodeService,
  LogicToCodeMistake
} from '../../../../../../services/mentor/advanced/logic-to-code/logic-to-code.service';

import { ToastService } from '../../../../../../services/toast.service';
import { ConfirmModalComponent } from '../../../../../../shared/confirm-modal/confirm-modal';

@Component({
  selector: 'app-mistake-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './mistake-management.html',
  styleUrl: './mistake-management.css'
})
export class MistakeManagement implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private logicToCodeService = inject(LogicToCodeService);
  private toastService = inject(ToastService);

  // DELETE CONFIRMATION MODAL
  showDeleteModal = signal(false);
  selectedMistakeId = signal<number | null>(null);

  problemId = Number(this.route.snapshot.paramMap.get('problemId'));

  // PAGE DATA
  mistakes = signal<LogicToCodeMistake[]>([]);

  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  isEditing = signal<boolean>(false);

  // FORM DATA
  mistakeId = signal<number | null>(null);
  mistakeTitle = signal<string>('');
  mistakeDescription = signal<string>('');

  ngOnInit(): void {
    if (!this.problemId || this.problemId <= 0) {
      this.toastService.error('Invalid problem ID.');
      this.goBack();
      return;
    }

    this.loadMistakes();
  }

  // LOAD ALL COMMON MISTAKES
  loadMistakes(): void {
    this.isLoading.set(true);

    this.logicToCodeService.getMistakes(this.problemId).subscribe({
      next: (response) => {
        this.mistakes.set(response.mistakes);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);

        this.toastService.error(
          error.error?.message || 'Failed to load common mistakes.'
        );
      }
    });
  }

  // UPDATE FORM TITLE
  updateTitle(value: string): void {
    this.mistakeTitle.set(value);
  }

  // UPDATE FORM DESCRIPTION
  updateDescription(value: string): void {
    this.mistakeDescription.set(value);
  }

  // OPEN ADD FORM
  openAddForm(): void {
    this.resetForm();
  }

  // OPEN EDIT FORM
  editMistake(mistake: LogicToCodeMistake): void {
    this.isEditing.set(true);
    this.mistakeId.set(mistake.id);

    this.mistakeTitle.set(mistake.mistake_title);
    this.mistakeDescription.set(mistake.mistake_description);
  }

  // SAVE COMMON MISTAKE
  saveMistake(): void {
    const title = this.mistakeTitle().trim();
    const description = this.mistakeDescription().trim();

    if (!title || !description) {
      this.toastService.error(
        'Mistake title and description are required.'
      );
      return;
    }

    const data = {
      mistake_title: title,
      mistake_description: description
    };

    this.isSaving.set(true);

    if (this.isEditing() && this.mistakeId() !== null) {
      this.logicToCodeService.updateMistake(
        this.problemId,
        this.mistakeId()!,
        data
      ).subscribe({
        next: (response) => {
          this.isSaving.set(false);

          this.toastService.success(
            response.message || 'Common mistake updated successfully.'
          );

          this.resetForm();
          this.loadMistakes();
        },
        error: (error) => {
          this.isSaving.set(false);

          this.toastService.error(
            error.error?.message || 'Failed to update common mistake.'
          );
        }
      });
    } else {
      this.logicToCodeService.addMistake(
        this.problemId,
        data
      ).subscribe({
        next: (response) => {
          this.isSaving.set(false);

          this.toastService.success(
            response.message || 'Common mistake added successfully.'
          );

          this.resetForm();
          this.loadMistakes();
        },
        error: (error) => {
          this.isSaving.set(false);

          this.toastService.error(
            error.error?.message || 'Failed to add common mistake.'
          );
        }
      });
    }
  }

  // OPEN DELETE CONFIRMATION
  openDeleteModal(mistakeId: number): void {
    this.selectedMistakeId.set(mistakeId);
    this.showDeleteModal.set(true);
  }

  // CLOSE DELETE CONFIRMATION
  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.selectedMistakeId.set(null);
  }

  // CONFIRM AND DELETE COMMON MISTAKE
  confirmDeleteMistake(): void {
    const mistakeId = this.selectedMistakeId();

    if (mistakeId === null) {
      return;
    }

    this.logicToCodeService.deleteMistake(
      this.problemId,
      mistakeId
    ).subscribe({
      next: (response) => {
        this.toastService.success(
          response.message || 'Common mistake deleted successfully.'
        );

        this.closeDeleteModal();
        this.loadMistakes();
      },
      error: (error) => {
        this.toastService.error(
          error.error?.message || 'Failed to delete mistake.'
        );

        this.closeDeleteModal();
      }
    });
  }

  // RESET FORM
  resetForm(): void {
    this.isEditing.set(false);
    this.mistakeId.set(null);

    this.mistakeTitle.set('');
    this.mistakeDescription.set('');
  }

  // BACK TO PROBLEM LIST
  goBack(): void {
    this.router.navigate([
      '/mentor/advanced/logic-to-code'
    ]);
  }
}
