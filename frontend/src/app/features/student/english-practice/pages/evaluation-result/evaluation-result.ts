
import {
  Component,
  inject,
  signal,
  OnInit
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import {
  SpeakingEvaluation
} from '../../models/evaluation/speaking-evaluation.model';

import {
  SpeakingAttemptHistory
} from '../../models/speaking/speaking-attempt.model';

import { EvaluationService } from '../../services/evaluation/evaluation.service';

import { ScoreCard } from '../../components/evaluation/score-card/score-card';
import { StrengthsList } from '../../components/evaluation/strengths-list/strengths-list';
import { ImprovementList } from '../../components/evaluation/improvement-list/improvement-list';
import { GrammarCorrections } from '../../components/evaluation/grammar-corrections/grammar-corrections';
import { SuggestionCard } from '../../components/evaluation/suggestion-card/suggestion-card';

@Component({
  selector: 'app-evaluation-result',
  imports: [
    ScoreCard,
    StrengthsList,
    ImprovementList,
    GrammarCorrections,
    SuggestionCard
  ],
  templateUrl: './evaluation-result.html',
  styleUrl: './evaluation-result.css'
})
export class EvaluationResult implements OnInit {

  private readonly route = inject(ActivatedRoute);

  private readonly evaluationService = inject(EvaluationService);

  readonly attempt = signal<SpeakingAttemptHistory | null>(null);

  readonly evaluation = signal<SpeakingEvaluation | null>(null);

  readonly loading = signal(false);

  readonly errorMessage = signal('');

  // LOAD SAVED EVALUATION USING ATTEMPT ID
  ngOnInit(): void {

    const attemptId = Number(
      this.route.snapshot.paramMap.get('attemptId')
    );

    if (!Number.isInteger(attemptId) || attemptId <= 0) {

      this.errorMessage.set('Invalid speaking attempt.');

      return;
    }

    this.loadEvaluation(attemptId);

  }

  // FETCH COMPLETE EVALUATION FROM BACKEND
  loadEvaluation(attemptId: number): void {

    this.loading.set(true);

    this.errorMessage.set('');

    this.evaluationService.getAttemptDetails(attemptId).subscribe({

      next: (response) => {

        this.attempt.set(response.attempt);

        this.evaluation.set(
          response.attempt.evaluation_result
        );

        this.loading.set(false);

      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message ||
          'Unable to load speaking evaluation.'
        );

        this.loading.set(false);

      }

    });

  }

}
