
import { Component, input } from '@angular/core';

import {
  SpeakingEvaluation
} from '../../../models/evaluation/speaking-evaluation.model';

@Component({
  selector: 'app-score-card',
  imports: [],
  templateUrl: './score-card.html',
  styleUrl: './score-card.css'
})
export class ScoreCard {

  readonly evaluation = input.required<SpeakingEvaluation>();

}
