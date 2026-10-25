
import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { TheoryQuizCsvPreview } from '../../../../../../../services/mentor/advanced/advanced-theory-quiz.service';

@Component({
  selector: 'app-csv-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './csv-preview.html',
  styleUrl: './csv-preview.css'
})
export class CsvPreview {
  readonly preview = input<TheoryQuizCsvPreview | null>(null);
  readonly canImport = input(false);
  readonly importing = input(false);

  readonly importRequested = output<void>();

  requestImport(): void {
    this.importRequested.emit();
  }
}
