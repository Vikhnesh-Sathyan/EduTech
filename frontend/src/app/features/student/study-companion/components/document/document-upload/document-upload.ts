
import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';

import { StudyDocumentService } from '../../../services/document/study-document.service';

import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [],
  templateUrl: './document-upload.html',
  styleUrl: './document-upload.css',
})
export class DocumentUpload {

  constructor(
    private studyDocumentService: StudyDocumentService,
    private toastService: ToastService,
    private router: Router
  ) {}

  // UPLOAD MODE
  uploadMode = signal<'pdf' | 'text'>('pdf');

  // PDF FILE
  selectedFile = signal<File | null>(null);
  fileError = signal('');

  // TEXT NOTES
  studyNotes = signal('');
  textError = signal('');

  // UPLOAD STATUS
  isUploading = signal(false);
  uploadError = signal('');

  // CHANGE UPLOAD MODE
  changeUploadMode(mode: 'pdf' | 'text'): void {

    if (this.isUploading()) return;

    this.uploadMode.set(mode);
    this.uploadError.set('');

  }

  // HANDLE PDF SELECTION
  onFileSelected(event: Event): void {

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.fileError.set('');
    this.uploadError.set('');

    if (!file) return;

    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {

      this.fileError.set('Please select a valid PDF file.');
      this.selectedFile.set(null);
      input.value = '';

      return;
    }

    if (file.size === 0) {

      this.fileError.set('The selected PDF file is empty.');
      this.selectedFile.set(null);
      input.value = '';

      return;
    }

    this.selectedFile.set(file);

  }

  // REMOVE SELECTED PDF
  removeSelectedFile(): void {

    this.selectedFile.set(null);
    this.fileError.set('');
    this.uploadError.set('');

  }

  // HANDLE TEXT INPUT
  onTextChanged(value: string): void {

    this.studyNotes.set(value);
    this.textError.set('');
    this.uploadError.set('');

  }

  // VALIDATE TEXT NOTES
  validateText(): boolean {

    this.textError.set('');

    const trimmedText = this.studyNotes().trim();

    if (!trimmedText) {

      this.textError.set('Please enter your study notes.');
      return false;

    }

    if (trimmedText.length < 50) {

      this.textError.set('Please enter at least 50 characters.');
      return false;

    }

    if (trimmedText.length > 1000000) {

      this.textError.set(
        'Your study notes exceed the maximum limit of 1 million characters.'
      );

      return false;

    }

    return true;

  }

  // UPLOAD PDF DOCUMENT
  uploadPdf(): void {

    const file = this.selectedFile();

    if (!file || this.isUploading()) return;

    this.uploadError.set('');
    this.fileError.set('');
    this.isUploading.set(true);

    this.studyDocumentService
      .uploadPdf(file)
      .subscribe({

        next: (response) => {

          this.isUploading.set(false);

          this.toastService.success('PDF uploaded successfully.');

          this.router.navigate([
            '/study-companion/session',
            response.session.sessionUuid
          ]);

        },

        error: (error) => {

          this.isUploading.set(false);

          const message =
            error.error?.message ||
            'Failed to upload your PDF. Please try again.';

          this.uploadError.set(message);
          this.toastService.error(message);

        }

      });

  }

  // UPLOAD TEXT NOTES
  uploadTextNotes(): void {

    if (this.isUploading() || !this.validateText()) return;

    this.uploadError.set('');
    this.isUploading.set(true);

    const cleanText = this.studyNotes().trim();

    this.studyDocumentService
      .uploadText(cleanText)
      .subscribe({

        next: (response) => {

          this.isUploading.set(false);

          this.toastService.success('Study notes uploaded successfully.');

          this.router.navigate([
            '/study-companion/session',
            response.session.sessionUuid
          ]);

        },

        error: (error) => {

          this.isUploading.set(false);

          const message =
            error.error?.message ||
            'Failed to upload your study notes. Please try again.';

          this.uploadError.set(message);
          this.toastService.error(message);

        }

      });

  }

}
