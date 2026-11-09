
import {
  Component,
  inject,
  signal,
  OnInit
} from '@angular/core';

import { SpeakingService } from '../../services/speaking/speaking.service';

import {
  SpeakingAttemptHistory
} from '../../models/speaking/speaking-attempt.model';

import { AttemptList } from '../../components/history/attempt-list/attempt-list';

@Component({
  selector: 'app-history',
  imports: [AttemptList],
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class History implements OnInit {

  private readonly speakingService = inject(SpeakingService);

  readonly attempts = signal<SpeakingAttemptHistory[]>([]);

  readonly loading = signal(false);

  readonly errorMessage = signal('');

  // LOAD SPEAKING HISTORY
  ngOnInit(): void {

    this.loadHistory();

  }

  // GET STUDENT ATTEMPTS
  loadHistory(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.speakingService.getHistory().subscribe({

      next: (response) => {

        this.attempts.set(response.attempts);

        this.loading.set(false);

      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message ||
          'Unable to load speaking history.'
        );

        this.loading.set(false);

      }

    });

  }

}
