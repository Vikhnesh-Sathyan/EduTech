import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  AdminDailyQuiz
} from '../../../../services/admin/daily-quiz/admin-daily-quiz.service';

import {
  AdminSubject
} from '../../../../services/admin/admin-subjects';

@Component({
  selector: 'app-csv-upload',
  imports: [FormsModule],
  templateUrl: './csv-upload.html',
  styleUrl: './csv-upload.css',
})
export class CsvUpload implements OnInit {

  // ==========================================
  // SUBJECTS
  // ==========================================

  subjects = signal<any[]>([]);
  selectedSubjectId = signal<number | null>(null);
  loadingSubjects = signal(false);

  // ==========================================
  // CSV FILE
  // ==========================================

  selectedFile = signal<File | null>(null);

  fileName = computed(() =>
    this.selectedFile()?.name || ''
  );

  // ==========================================
  // PREVIEW
  // ==========================================

  previewData = signal<any | null>(null);
  previewing = signal(false);

  // ==========================================
  // IMPORT
  // ==========================================

  importing = signal(false);
  importSuccess = signal('');
  importError = signal('');

  // ==========================================
  // GENERAL ERROR
  // ==========================================

  errorMessage = signal('');

  constructor(
    private dailyQuizService: AdminDailyQuiz,
    private subjectService: AdminSubject
  ) {}

  ngOnInit(): void {
    this.loadSubjects();
  }

  // ==========================================
  // LOAD SUBJECTS
  // ==========================================

  loadSubjects(): void {

    this.loadingSubjects.set(true);
    this.errorMessage.set('');

    this.subjectService.getSubjects().subscribe({

      next: (response: any) => {

        this.subjects.set(
          response.data || response.subjects || response
        );

        this.loadingSubjects.set(false);

      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message || 'Failed to load subjects'
        );

        this.loadingSubjects.set(false);

      }

    });

  }

  // ==========================================
  // SUBJECT CHANGE
  // ==========================================

  onSubjectChange(subjectId: number | null): void {

    this.selectedSubjectId.set(subjectId);

    this.resetUploadState();

  }

  // ==========================================
  // SELECT CSV FILE
  // ==========================================

  onFileSelected(event: Event): void {

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.resetUploadState();

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {

      this.errorMessage.set('Please select a CSV file');

      input.value = '';

      return;

    }

    this.selectedFile.set(file);

  }

  // ==========================================
  // PREVIEW CSV
  // ==========================================

  previewCsv(): void {

    const subjectId = this.selectedSubjectId();
    const file = this.selectedFile();

    if (!subjectId) {
      this.errorMessage.set('Please select a subject');
      return;
    }

    if (!file) {
      this.errorMessage.set('Please select a CSV file');
      return;
    }

    this.previewing.set(true);

    this.errorMessage.set('');
    this.importError.set('');
    this.importSuccess.set('');
    this.previewData.set(null);

    this.dailyQuizService.previewCsv(subjectId, file).subscribe({

      next: (response: any) => {

        this.previewData.set(response);

        this.previewing.set(false);

      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message || 'CSV preview failed'
        );

        this.previewing.set(false);

      }

    });

  }

  // ==========================================
  // IMPORT CSV
  // ==========================================

  importCsv(): void {

    const subjectId = this.selectedSubjectId();
    const file = this.selectedFile();
    const preview = this.previewData();

    if (!subjectId || !file || !preview) {
      this.errorMessage.set(
        'Please preview the CSV before importing'
      );
      return;
    }

    if (preview.invalid_count > 0 || preview.valid_count === 0) {
      this.errorMessage.set(
        'Please correct all invalid rows before importing'
      );
      return;
    }

    this.importing.set(true);

    this.errorMessage.set('');
    this.importError.set('');
    this.importSuccess.set('');

    this.dailyQuizService.importCsv(subjectId, file).subscribe({

      next: (response: any) => {

        this.importSuccess.set(
          `${response.message || 'Questions imported successfully'} (${response.imported_count} questions)`
        );

        this.importing.set(false);

        // Clear uploaded file and preview.
        this.resetFileInput();

        this.previewData.set(null);

      },

      error: (error) => {

        this.importError.set(
          error.error?.message || 'CSV import failed'
        );

        this.importing.set(false);

      }

    });

  }

  // ==========================================
  // RESET NATIVE FILE INPUT
  // ==========================================

  private resetFileInput(): void {

    const fileInput = document.getElementById(
      'csvFile'
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = '';
    }

    this.selectedFile.set(null);

  }

  // ==========================================
  // RESET UPLOAD STATE
  // ==========================================

  resetUploadState(): void {

    this.selectedFile.set(null);

    this.previewData.set(null);

    this.importSuccess.set('');

    this.importError.set('');

    this.errorMessage.set('');

    // Clear the native input when changing subjects.
    this.resetNativeFileInput();

  }

  private resetNativeFileInput(): void {

    const fileInput = document.getElementById(
      'csvFile'
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = '';
    }

  }

}
