
import {
  Component,
  computed,
  effect,
  input,
  signal
} from '@angular/core';

import { StudyDocumentViewerService } from '../../../services/document/study-document-viewer.service';

import {
  StudyDocumentPagesResponse
} from '../../../models/document/study-document-pages.model';

import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  imports: [],
  templateUrl: './document-viewer.html',
  styleUrl: './document-viewer.css',
})
export class DocumentViewer {

  // SESSION INPUT SIGNAL
  sessionUuid = input.required<string>();

  constructor(
    private documentViewerService: StudyDocumentViewerService,
    private toastService: ToastService
  ) {

    // LOAD DOCUMENT WHEN SESSION CHANGES
    effect(() => {

      const uuid = this.sessionUuid();

      if (uuid) {
        this.loadDocumentPages(uuid);
      }

    });

  }

  // DOCUMENT DATA
  documentData = signal<StudyDocumentPagesResponse | null>(null);

  // PAGE INDEX
  currentPageIndex = signal(0);

  // LOADING AND ERROR STATES
  isLoading = signal(false);

  errorMessage = signal('');

  // CURRENT PAGE
  currentPage = computed(() => {

    const document = this.documentData();

    if (!document) return null;

    return document.pages[this.currentPageIndex()] || null;

  });

  // PAGE PROGRESS
  pageProgress = computed(() => {

    const document = this.documentData();

    if (!document || document.pages.length === 0) {
      return 0;
    }

    return (
      ((this.currentPageIndex() + 1) / document.pages.length) * 100
    );

  });

  // LOAD DOCUMENT PAGES
  loadDocumentPages(sessionUuid: string): void {

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.documentData.set(null);
    this.currentPageIndex.set(0);

    this.documentViewerService
      .getDocumentPages(sessionUuid)
      .subscribe({

        next: (response: StudyDocumentPagesResponse) => {

          this.documentData.set(response);

          this.isLoading.set(false);

        },

        error: (error) => {

          this.isLoading.set(false);

          const message =
            error.error?.message ||
            'Unable to load document pages.';

          this.errorMessage.set(message);

          this.toastService.error(message);

        }

      });

  }

  // PREVIOUS PAGE
  previousPage(): void {

    this.currentPageIndex.update(index =>
      Math.max(0, index - 1)
    );

  }

  // NEXT PAGE
  nextPage(): void {

    const document = this.documentData();

    if (!document) return;

    this.currentPageIndex.update(index =>
      Math.min(index + 1, document.pages.length - 1)
    );

  }

}
