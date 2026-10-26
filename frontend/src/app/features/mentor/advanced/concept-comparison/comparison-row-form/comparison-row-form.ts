import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormsModule } from '@angular/forms';

interface ComparisonConceptOption {
  id: number;
  name: string;
}

interface ComparisonRowCell {
  concept_id: number;
  content_text: string | null;
  image_url?: string | null;
}

interface ComparisonRowData {
  id: number;
  point_title: string;
  cells: ComparisonRowCell[];
}

export interface ComparisonRowFormValue {
  pointTitle: string;
  cells: {
    content: string;
  }[];
}

@Component({
  selector: 'app-comparison-row-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comparison-row-form.html',
  styleUrl: './comparison-row-form.css'
})
export class ComparisonRowFormComponent implements OnChanges {
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() initialTitle = '';
  @Input() initialRow: ComparisonRowData | null = null;
  @Input() concepts: ComparisonConceptOption[] = [];
  @Input() saving = false;

  @Output() save = new EventEmitter<ComparisonRowFormValue>();
  @Output() cancel = new EventEmitter<void>();

  pointTitle = '';

  // Stores content by concept ID, so content stays with the right concept.
  cellContents: Record<number, string> = {};

  titleError = '';
  cellErrors: Record<number, string> = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['initialRow'] ||
      changes['initialTitle'] ||
      changes['concepts'] ||
      changes['mode']
    ) {
      this.pointTitle =
        this.initialRow?.point_title ?? this.initialTitle ?? '';

      const nextContents: Record<number, string> = {};

      for (const concept of this.concepts) {
        const existingCell = this.initialRow?.cells.find(
          cell => cell.concept_id === concept.id
        );

        nextContents[concept.id] = existingCell?.content_text ?? '';
      }

      this.cellContents = nextContents;
      this.titleError = '';
      this.cellErrors = {};
    }
  }

  onTitleChange(value: string): void {
    this.pointTitle = value;
    this.titleError = '';
  }

  onCellChange(conceptId: number, value: string): void {
    this.cellContents[conceptId] = value;

    const updatedErrors = { ...this.cellErrors };
    delete updatedErrors[conceptId];
    this.cellErrors = updatedErrors;
  }

  submit(): void {
    if (this.saving) {
      return;
    }

    const title = this.pointTitle.trim();

    if (!title) {
      this.titleError = 'Please enter a comparison point title.';
      return;
    }

    if (title.length > 150) {
      this.titleError = 'The title cannot exceed 150 characters.';
      return;
    }

    const nextErrors: Record<number, string> = {};

    for (const concept of this.concepts) {
      const content = this.cellContents[concept.id] ?? '';

      if (content.length > 5000) {
        nextErrors[concept.id] =
          'Content cannot exceed 5000 characters.';
      }
    }

    this.cellErrors = nextErrors;

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    this.save.emit({
      pointTitle: title,
      // Keep cells in the same order as the concepts supplied by the parent.
      cells: this.concepts.map(concept => ({
        content: (this.cellContents[concept.id] ?? '').trim()
      }))
    });
  }

  onCancel(): void {
    if (!this.saving) {
      this.cancel.emit();
    }
  }
}