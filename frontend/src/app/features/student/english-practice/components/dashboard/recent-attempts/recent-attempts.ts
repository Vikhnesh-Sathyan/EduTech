
import {
  Component,
  inject,
  signal,
  computed,
  OnInit
} from '@angular/core';

import { RouterLink } from '@angular/router';

import { SpeakingService } from '../../../services/speaking/speaking.service';

import {
  SpeakingAttemptHistory
} from '../../../models/speaking/speaking-attempt.model';

import { AttemptCard } from '../../history/attempt-card/attempt-card';

@Component({
  selector: 'app-recent-attempts',
  imports: [RouterLink, AttemptCard],
  templateUrl: './recent-attempts.html',
  styleUrl: './recent-attempts.css'
})
export class RecentAttempts implements OnInit {

  private readonly speakingService = inject(SpeakingService);

  readonly attempts = signal<SpeakingAttemptHistory[]>([]);

  readonly recentAttempts = computed(() =>
    this.attempts().slice(0, 3)
  );

  readonly loading = signal(false);

  ngOnInit(): void {

    this.loading.set(true);

    this.speakingService.getHistory().subscribe({

      next: (response) => {
        this.attempts.set(response.attempts);
        this.loading.set(false);
      },

      error: (error) => {
        console.error(
          'Unable to load recent speaking attempts:',
          error
        );

        this.loading.set(false);
      }

    });

  }

}
