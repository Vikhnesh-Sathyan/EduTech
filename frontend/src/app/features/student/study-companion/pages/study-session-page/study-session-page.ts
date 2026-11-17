import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { StudySessionService } from '../../services/session/study-session.service';
import { DocumentViewer } from '../../components/document/document-viewer/document-viewer';
import { ChatPanel } from '../../components/chat/chat-panel/chat-panel';
import { SummaryPanel } from '../../components/summary/summary-panel/summary-panel';
import { ImportantPointsPanel } from '../../components/important-points/important-points-panel/important-points-panel';
import { ToastService } from '../../../../../services/toast.service';
import { StudySessionRestoreResponse } from '../../models/session/study-session.model';

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

  private route = inject(ActivatedRoute);
  private studySessionService = inject(StudySessionService);
  private toastService = inject(ToastService);

  sessionData = signal<StudySessionRestoreResponse | null>(null);
  sessionUuid = signal('');
  isLoading = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    const uuid = this.route.snapshot.paramMap.get('sessionUuid') || '';
    this.sessionUuid.set(uuid);

    if (!uuid) {
      this.errorMessage.set('Invalid study session.');
      this.toastService.error('Invalid study session.');
      return;
    }

    this.restoreSession();
  }

  restoreSession(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.studySessionService
      .restoreSession(this.sessionUuid())
      .subscribe({
        next: (response) => {
          this.sessionData.set(response);
          this.isLoading.set(false);
          this.toastService.success('Study session restored successfully.');
        },
        error: (error) => {
          const message =
            error.error?.message || 'Unable to restore your study session.';

          this.errorMessage.set(message);
          this.isLoading.set(false);
          this.toastService.error(message);
        }
      });
  }
}