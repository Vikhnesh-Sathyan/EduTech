
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { StudySessionService } from '../../services/session/study-session.service';

import { DocumentViewer } from '../../components/document/document-viewer/document-viewer';

import { ChatPanel } from '../../components/chat/chat-panel/chat-panel';

import { SummaryPanel } from '../../components/summary/summary-panel/summary-panel';

import { ImportantPointsPanel } from '../../components/important-points/important-points-panel/important-points-panel';

import { ToastService } from '../../../../../services/toast.service';

import {
  StudySessionRestoreResponse
} from '../../models/session/study-session.model';

@Component({
  selector: 'app-study-session-page',
  standalone: true,
  imports: [
  RouterLink,
  DocumentViewer,
  ChatPanel,
  SummaryPanel,
  ImportantPointsPanel
 
],
  templateUrl: './study-session-page.html',
  styleUrl: './study-session-page.css',
})
export class StudySessionPage implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private studySessionService: StudySessionService,
    private toastService: ToastService
  ) {}

  sessionData: StudySessionRestoreResponse | null = null;

  sessionUuid = '';

  isLoading = false;

  errorMessage = '';

  // ==========================================
  // INITIALIZE SESSION
  // ==========================================

  ngOnInit(): void {

    this.sessionUuid =
      this.route.snapshot.paramMap.get('sessionUuid') || '';

    if (!this.sessionUuid) {

      this.errorMessage = 'Invalid study session.';

      this.toastService.error(this.errorMessage);

      return;

    }

    this.restoreSession();

  }

  // ==========================================
  // RESTORE STUDY SESSION
  // ==========================================

  restoreSession(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.studySessionService
      .restoreSession(this.sessionUuid)
      .subscribe({

        next: (response) => {

          this.sessionData = response;

          this.isLoading = false;

          this.toastService.success(
            'Study session restored successfully.'
          );

        },

        error: (error) => {

          this.isLoading = false;

          this.errorMessage =
            error.error?.message ||
            'Unable to restore your study session.';

          this.toastService.error(this.errorMessage);

        }

      });

  }

}
