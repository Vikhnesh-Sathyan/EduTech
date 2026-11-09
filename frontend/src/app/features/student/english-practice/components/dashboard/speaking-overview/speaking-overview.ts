
import {
  Component,
  inject,
  signal,
  computed,
  OnInit
} from '@angular/core';

import { SpeakingService } from '../../../services/speaking/speaking.service';

import {
  SpeakingAttemptHistory
} from '../../../models/speaking/speaking-attempt.model';

@Component({
  selector: 'app-speaking-overview',
  imports: [],
  templateUrl: './speaking-overview.html',
  styleUrl: './speaking-overview.css'
})
export class SpeakingOverview implements OnInit {

  private readonly speakingService = inject(SpeakingService);

  // Store speaking history from the backend.
  readonly attempts = signal<SpeakingAttemptHistory[]>([]);

  // Count all speaking attempts.
  readonly totalAttempts = computed(() =>
    this.attempts().length
  );

  // Calculate average score from completed attempts only.
  readonly averageScore = computed(() => {

    const completedAttempts = this.attempts().filter(
      attempt =>
        attempt.status === 'completed' &&
        attempt.overall_score !== null
    );

    if (completedAttempts.length === 0) {
      return null;
    }

    const totalScore = completedAttempts.reduce(
      (sum, attempt) => sum + (attempt.overall_score ?? 0),
      0
    );

    return Math.round(
      totalScore / completedAttempts.length
    );

  });

  // Calculate total words spoken across all attempts.
  readonly totalWords = computed(() =>
    this.attempts().reduce(
      (total, attempt) => total + attempt.word_count,
      0
    )
  );

  ngOnInit(): void {

    this.speakingService.getHistory().subscribe({

      next: (response) => {
        this.attempts.set(response.attempts);
      },

      error: (error) => {
        console.error(
          'Unable to load speaking statistics:',
          error
        );
      }

    });

  }

}
