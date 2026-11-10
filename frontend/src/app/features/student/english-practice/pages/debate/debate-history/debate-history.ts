
import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, TitleCasePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';

import { DebateService } from '../../../services/debate/debate.service';
import { DebateSession } from '../../../models/debate/debate.model';

@Component({
  selector: 'app-debate-history',
  standalone: true,
  imports: [DatePipe, TitleCasePipe, DecimalPipe],
  templateUrl: './debate-history.html',
  styleUrl: './debate-history.css',
})
export class DebateHistory implements OnInit {

  private debateService = inject(DebateService);
  private router = inject(Router);

  // Debate history
  sessions = signal<DebateSession[]>([]);

  // Loading and error states
  isLoading = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.debateService.getHistory().subscribe({
      next: (response) => {
        this.sessions.set(response.sessions || []);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);

        this.errorMessage.set(
          error.error?.message ||
          'Unable to load debate history.'
        );
      }
    });
  }

  openSession(session: DebateSession): void {

    if (session.status === 'active') {
      this.router.navigate([
        '/english-practice/debate/room',
        session.id
      ]);

      return;
    }

    if (session.status === 'completed') {
      this.router.navigate([
        '/english-practice/debate/result',
        session.id
      ]);
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/english-practice/debate']);
  }

  viewResult(sessionId: number): void {
  this.router.navigate([
    '/english-practice/debate/result',
    sessionId
  ]);
}
}
