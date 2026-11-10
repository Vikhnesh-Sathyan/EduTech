
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';

import { DebateService } from '../../../services/debate/debate.service';
import { DebateSession } from '../../../models/debate/debate.model';

@Component({
  selector: 'app-debate-result',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './debate-result.html',
  styleUrl: './debate-result.css',
})
export class DebateResult implements OnInit {

  private debateService = inject(DebateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Debate result
  session = signal<DebateSession | null>(null);

  // Loading and error states
  isLoading = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {

    const sessionId = Number(
      this.route.snapshot.paramMap.get('sessionId')
    );

    if (!sessionId || isNaN(sessionId)) {
      this.errorMessage.set('Invalid debate session.');
      this.isLoading.set(false);
      return;
    }

    this.loadResult(sessionId);
  }

  // Load the completed debate and its evaluation
  loadResult(sessionId: number): void {

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.debateService.getSessionDetails(sessionId)
      .subscribe({

        next: (response) => {

          this.session.set(response.session);
          this.isLoading.set(false);

          if (!response.session.evaluation_result) {
            this.errorMessage.set(
              'Evaluation results are not available for this session.'
            );
          }
        },

        error: (error) => {

          this.isLoading.set(false);

          this.errorMessage.set(
            error.error?.message ||
            'Unable to load your debate evaluation.'
          );
        }
      });
  }

  // Navigate to debate dashboard
  goToDashboard(): void {

    this.router.navigate([
      '/english-practice/debate'
    ]);
  }

  // Navigate to debate history
  viewHistory(): void {

    this.router.navigate([
      '/english-practice/debate/history'
    ]);
  }
}
