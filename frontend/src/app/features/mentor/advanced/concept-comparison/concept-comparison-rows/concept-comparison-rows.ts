import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface ComparisonRowDraft {
  pointTitle: string;
  cells: { content: string }[];
}

@Component({
  selector: 'app-concept-comparison-rows',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './concept-comparison-rows.html',
  styleUrl: './concept-comparison-rows.css'
})
export class ConceptComparisonRows implements OnChanges {

  @Input() concepts: { id: number; name: string }[] = [];

  @Output() rowsChange = new EventEmitter<ComparisonRowDraft[]>();

  rows: ComparisonRowDraft[] = [
    { pointTitle: '', cells: [{ content: '' }, { content: '' }] }
  ];

  addRow(): void {
    this.rows.push({
      pointTitle: '',
      cells: this.concepts.map(() => ({ content: '' }))
    });

    this.emitRows();
  }

  removeRow(index: number): void {
    if (this.rows.length <= 1) return;

    this.rows.splice(index, 1);
    this.emitRows();
  }

  updateRowsForConcepts(): void {
    this.rows = this.rows.map(row => ({
      ...row,
      cells: this.concepts.map((_, index) => ({
        content: row.cells[index]?.content ?? ''
      }))
    }));

    this.emitRows();
  }

  emitRows(): void {
    this.rowsChange.emit(this.rows);
  }

    ngOnChanges(): void {
    this.updateRowsForConcepts();
  }
}