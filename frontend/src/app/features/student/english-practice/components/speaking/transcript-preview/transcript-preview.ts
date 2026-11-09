
import { Component, input } from '@angular/core';

import {
  SpeakingTranscription
} from '../../../models/speaking/speaking-transcription.model';

@Component({
  selector: 'app-transcript-preview',
  imports: [],
  templateUrl: './transcript-preview.html',
  styleUrl: './transcript-preview.css'
})
export class TranscriptPreview {

  readonly transcription =
    input.required<SpeakingTranscription>();

}
