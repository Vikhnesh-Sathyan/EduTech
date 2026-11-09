
import { Component, input, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import {
  SpeakingAttemptHistory
} from '../../../models/speaking/speaking-attempt.model';

@Component({
  selector: 'app-attempt-card',
  imports: [DatePipe],
  templateUrl: './attempt-card.html',
  styleUrl: './attempt-card.css'
})
export class AttemptCard {

  private readonly router = inject(Router);

  readonly attempt = input.required<SpeakingAttemptHistory>();

  // OPEN SAVED EVALUATION
  openDetails(): void {

    const currentAttempt = this.attempt();

    if (currentAttempt.status !== 'completed') {
      return;
    }

    this.router.navigate([
      '/english-practice/result',
      currentAttempt.id
    ]);

  }

}
