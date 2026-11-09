import { Component, input } from '@angular/core';

import { AttemptCard } from '../attempt-card/attempt-card';

import {
  SpeakingAttemptHistory
} from '../../../models/speaking/speaking-attempt.model';

@Component({
  selector: 'app-attempt-list',
  imports: [AttemptCard],
  templateUrl: './attempt-list.html',
  styleUrl: './attempt-list.css'
})
export class AttemptList {

  readonly attempts = input<SpeakingAttemptHistory[]>([]);

}