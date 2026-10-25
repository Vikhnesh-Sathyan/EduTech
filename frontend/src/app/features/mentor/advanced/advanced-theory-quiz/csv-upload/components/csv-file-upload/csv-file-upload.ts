
import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-csv-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './csv-file-upload.html',
  styleUrl: './csv-file-upload.css'
})
export class CsvFileUpload {
  readonly selectedFile = input<File | null>(null);
  readonly loading = input(false);
  readonly importing = input(false);

  readonly fileSelected = output<File | null>();
  readonly previewRequested = output<void>();

  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0] ?? null;

    this.fileSelected.emit(file);
  }

  requestPreview(): void {
    this.previewRequested.emit();
  }
}
