import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import {
  ConceptComparisonService,
  ComparisonDetails,
  ComparisonDetailRow,
  ComparisonRowSaveInput
} from '../../../../../services/mentor/advanced/concept-comparison/concept-comparison.service';

import { ToastService } from '../../../../../services/toast.service';

import {
  ComparisonRowFormComponent,
  ComparisonRowFormValue
} from '../comparison-row-form/comparison-row-form';

import { ComparisonConceptFormComponent } from '../comparison-concept-form/comparison-concept-form';
import { ConfirmModalComponent } from '../../../../../shared/confirm-modal/confirm-modal';

@Component({
  selector: 'app-comparison-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ComparisonRowFormComponent,
    ConfirmModalComponent
  ],
  templateUrl: './comparison-details.html',
  styleUrl: './comparison-details.css'
})
export class ComparisonDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly comparisonService = inject(ConceptComparisonService);
  private readonly toastService = inject(ToastService);

  // ==================== COMPARISON STATE ====================

  comparison = signal<ComparisonDetails | null>(null);
  loading = signal(false);
  errorMessage = signal('');

  // ==================== ROW FORM STATE ====================

  showRowForm = signal(false);
  rowFormMode = signal<'add' | 'edit'>('add');
  editingRowId = signal<number | null>(null);
  editingRow = signal<ComparisonDetailRow | null>(null);
  editingRowTitle = signal('');
  savingRow = signal(false);

  // ==================== DELETE ROW STATE ====================

  showDeleteRowModal = signal(false);
  deletingRowId = signal<number | null>(null);
  deletingRow = signal(false);

  // ==================== PUBLISH STATE ====================

  publishing = signal(false);

  // ==================== INITIALIZATION ====================

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage.set('Invalid comparison ID.');
      return;
    }

    this.loadComparison(id);
  }

  // ==================== LOAD COMPARISON ====================

  loadComparison(id: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.comparisonService.getComparisonById(id).subscribe({
      next: response => {
        this.comparison.set(response.comparison);
        this.loading.set(false);
      },
      error: error => {
        console.error('Failed to load comparison details:', error);

        this.errorMessage.set(
          error.error?.message ||
          'Failed to load comparison details.'
        );

        this.loading.set(false);
      }
    });
  }

  isDraft(): boolean {
    return this.comparison()?.status === 'draft';
  }

  // ==================== ADD ROW ====================

  openAddRowForm(): void {
    if (!this.isDraft()) {
      this.toastService.info(
        'Only draft comparisons can be edited.'
      );
      return;
    }

    this.rowFormMode.set('add');
    this.editingRowId.set(null);
    this.editingRow.set(null);
    this.editingRowTitle.set('');
    this.showRowForm.set(true);
  }

  // ==================== EDIT ROW ====================

  openEditRowForm(row: ComparisonDetailRow): void {
    if (!this.isDraft()) {
      this.toastService.info(
        'Only draft comparisons can be edited.'
      );
      return;
    }

    this.rowFormMode.set('edit');
    this.editingRowId.set(row.id);
    this.editingRow.set(row);
    this.editingRowTitle.set(row.point_title);
    this.showRowForm.set(true);
  }

  // ==================== CLOSE ROW FORM ====================

  closeRowForm(): void {
    if (this.savingRow()) {
      return;
    }

    this.resetRowForm();
  }

  private resetRowForm(): void {
    this.showRowForm.set(false);
    this.editingRowId.set(null);
    this.editingRow.set(null);
    this.editingRowTitle.set('');
  }

  // ==================== SAVE ROW AND CELL CONTENT ====================

  onSaveRowTitle(value: ComparisonRowFormValue): void {
    const comparison = this.comparison();

    if (!comparison || this.savingRow()) {
      return;
    }

    if (!this.isDraft()) {
      this.toastService.error(
        'Only draft comparisons can be edited.'
      );
      return;
    }

    const pointTitle = value.pointTitle.trim();

    if (!pointTitle) {
      this.toastService.error(
        'Comparison point title is required.'
      );
      return;
    }

    if (pointTitle.length > 150) {
      this.toastService.error(
        'Comparison point title cannot exceed 150 characters.'
      );
      return;
    }

    // Build the cell payload using the current concept order.
    // This keeps each definition connected to the correct concept.
    const cells = comparison.concepts.map((concept, index) => {
      const existingCell = this.editingRow()?.cells.find(
        cell => cell.concept_id === concept.id
      );

      return {
        conceptId: concept.id,
        content: value.cells[index]?.content?.trim() ?? '',
        imageUrl: existingCell?.image_url ?? null
      };
    });

    const payload: ComparisonRowSaveInput = {
      pointTitle,
      cells
    };

    this.savingRow.set(true);

    const rowId = this.editingRowId();

    if (this.rowFormMode() === 'add') {
      this.comparisonService
        .addComparisonRow(comparison.id, payload)
        .subscribe({
          next: () => {
            this.toastService.success(
              'Comparison row added successfully.'
            );

            this.finishRowSave(comparison.id);
          },
          error: error => {
            console.error('Add comparison row failed:', error);

            this.toastService.error(
              error.error?.message ||
              'Failed to add comparison row.'
            );

            this.savingRow.set(false);
          }
        });

      return;
    }

    if (rowId === null) {
      this.toastService.error('No comparison row selected.');
      this.savingRow.set(false);
      return;
    }

    this.comparisonService
      .updateComparisonRow(rowId, payload)
      .subscribe({
        next: () => {
          this.toastService.success(
            'Comparison row and definitions updated successfully.'
          );

          this.finishRowSave(comparison.id);
        },
        error: error => {
          console.error('Update comparison row failed:', error);

          this.toastService.error(
            error.error?.message ||
            'Failed to update comparison row and definitions.'
          );

          this.savingRow.set(false);
        }
      });
  }

  private finishRowSave(comparisonId: number): void {
    this.resetRowForm();
    this.savingRow.set(false);
    this.loadComparison(comparisonId);
  }

  // ==================== DELETE ROW ====================

  openDeleteRowModal(rowId: number): void {
    if (!this.isDraft()) {
      this.toastService.info(
        'Only draft comparisons can be edited.'
      );
      return;
    }

    this.deletingRowId.set(rowId);
    this.showDeleteRowModal.set(true);
  }

  closeDeleteRowModal(): void {
    if (this.deletingRow()) {
      return;
    }

    this.showDeleteRowModal.set(false);
    this.deletingRowId.set(null);
  }

  onConfirmDeleteRow(): void {
    const comparison = this.comparison();
    const rowId = this.deletingRowId();

    if (
      !comparison ||
      rowId === null ||
      this.deletingRow()
    ) {
      return;
    }

    if (!this.isDraft()) {
      this.toastService.error(
        'Only draft comparisons can be edited.'
      );

      this.closeDeleteRowModal();
      return;
    }

    this.deletingRow.set(true);

    this.comparisonService
      .deleteComparisonRow(rowId)
      .subscribe({
        next: () => {
          this.toastService.success(
            'Comparison row deleted successfully.'
          );

          this.showDeleteRowModal.set(false);
          this.deletingRowId.set(null);
          this.deletingRow.set(false);

          this.loadComparison(comparison.id);
        },
        error: error => {
          console.error('Delete comparison row failed:', error);

          this.toastService.error(
            error.error?.message ||
            'Failed to delete comparison row.'
          );

          this.deletingRow.set(false);
        }
      });
  }

  // ==================== PUBLISH COMPARISON ====================

  publishComparison(): void {
    const comparison = this.comparison();

    if (
      !comparison ||
      comparison.status !== 'draft' ||
      this.publishing()
    ) {
      return;
    }

    this.publishing.set(true);

    this.comparisonService
      .publishComparison(comparison.id)
      .subscribe({
        next: () => {
          this.toastService.success(
            'Comparison published successfully.'
          );

          this.publishing.set(false);
          this.loadComparison(comparison.id);
        },
        error: error => {
          console.error('Publish comparison failed:', error);

          this.toastService.error(
            error.error?.message ||
            'Failed to publish comparison.'
          );

          this.publishing.set(false);
        }
      });
  }

  // ==================== UNPUBLISH COMPARISON ====================

  unpublishComparison(): void {
    const comparison = this.comparison();

    if (
      !comparison ||
      comparison.status !== 'published' ||
      this.publishing()
    ) {
      return;
    }

    this.publishing.set(true);

    this.comparisonService
      .unpublishComparison(comparison.id)
      .subscribe({
        next: () => {
          this.toastService.success(
            'Comparison unpublished successfully.'
          );

          this.publishing.set(false);
          this.loadComparison(comparison.id);
        },
        error: error => {
          console.error(
            'Unpublish comparison failed:',
            error
          );

          this.toastService.error(
            error.error?.message ||
            'Failed to unpublish comparison.'
          );

          this.publishing.set(false);
        }
      });
  }
}