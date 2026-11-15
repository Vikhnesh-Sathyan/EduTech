
import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { StudyDocumentService } from '../../../services/document/study-document.service';

import {
  StudyDocumentListItem
} from '../../../models/document/study-document.model';

import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [],
  templateUrl: './document-list.html',
  styleUrl: './document-list.css',
})
export class DocumentList implements OnInit {

  constructor(
    private studyDocumentService: StudyDocumentService,
    private toastService: ToastService,
    private router: Router
  ) {}

  // DOCUMENT DATA
  documents = signal<StudyDocumentListItem[]>([]);

  // LOADING AND ERROR STATES
  isLoading = signal(false);

  errorMessage = signal('');

  // INITIALIZE COMPONENT
  ngOnInit(): void {
    this.loadDocuments();
  }

  // LOAD STUDENT DOCUMENTS
  loadDocuments(): void {

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.studyDocumentService.getStudentDocuments().subscribe({

      next: (response) => {

        this.documents.set(response.documents);

        this.isLoading.set(false);

      },

      error: (error) => {

        this.isLoading.set(false);

        const message =
          error.error?.message ||
          'Unable to load your study documents.';

        this.errorMessage.set(message);

        this.toastService.error(message);

      }

    });

  }

  // OPEN STUDY SESSION
  openSession(sessionUuid: string): void {

    this.router.navigate([
      '/study-companion/session',
      sessionUuid
    ]);

  }

  // CHECK DOCUMENT AVAILABILITY
  canOpenSession(document: StudyDocumentListItem): boolean {

    return (
      document.processingStatus === 'completed' &&
      document.sessionStatus !== 'deleted' &&
      document.sessionStatus !== 'failed'
    );

  }

}
