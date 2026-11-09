
import {
  Component,
  inject,
  signal,
  OnInit
} from '@angular/core';

import { Router } from '@angular/router';

import {
  SpeakingEvaluation
} from '../../models/evaluation/speaking-evaluation.model';

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

  private readonly router = inject(Router);

  readonly evaluation = signal<SpeakingEvaluation | null>(null);

  // LOAD EVALUATION RESULT
  ngOnInit(): void {

    const result = history.state?.evaluation as
      SpeakingEvaluation | undefined;

    if (!result) {

      this.router.navigate([
        '/student/english-practice/topics'
      ]);

      return;

    }

    this.evaluation.set(result);

  }

}
