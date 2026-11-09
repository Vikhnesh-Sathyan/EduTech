
import { Component, input } from '@angular/core';

import {
  SpeakingAttemptHistory
} from '../../../models/speaking/speaking-attempt.model';

@Component({
  selector: 'app-attempt-list',
  imports: [],
  templateUrl: './attempt-list.html',
  styleUrl: './attempt-list.css'
})
export class AttemptList {

  readonly attempts = input<SpeakingAttemptHistory[]>([]);

}
