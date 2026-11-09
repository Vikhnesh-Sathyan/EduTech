
import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';

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

  readonly attempt = input.required<SpeakingAttemptHistory>();

}
