
import {
  Component,
  inject,
  signal,
  OnInit
} from '@angular/core';

import { Router } from '@angular/router';

import { AudioRecorder } from '../../components/speaking/audio-recorder/audio-recorder';

import { TranscriptPreview } from '../../components/speaking/transcript-preview/transcript-preview';

import { SpeakingService } from '../../services/speaking/speaking.service';

import { EvaluationService } from '../../services/evaluation/evaluation.service';

import { SpeakingTopic } from '../../models/topics/speaking-topic.model';

import {
  SpeakingTranscriptionResponse
} from '../../models/speaking/speaking-transcription.model';

@Component({
  selector: 'app-speaking-practice',
  imports: [
    AudioRecorder,
    TranscriptPreview
  ],
  templateUrl: './speaking-practice.html',
  styleUrl: './speaking-practice.css'
})
export class SpeakingPractice implements OnInit {

  private readonly router = inject(Router);

  private readonly speakingService = inject(SpeakingService);

  private readonly evaluationService = inject(EvaluationService);

  readonly topic = signal<SpeakingTopic | null>(null);

  readonly uploading = signal(false);

  readonly evaluating = signal(false);

  readonly transcription = signal<SpeakingTranscriptionResponse | null>(null);

  readonly errorMessage = signal('');

  // LOAD SELECTED TOPIC
  ngOnInit(): void {

    const selectedTopic = history.state?.topic as
      SpeakingTopic | undefined;

    if (!selectedTopic) {

      this.router.navigate([
        '/student/english-practice/topics'
      ]);

      return;

    }

    this.topic.set(selectedTopic);

  }

  // RECEIVE RECORDED AUDIO
  onRecordingComplete(file: File): void {

    const selectedTopic = this.topic();

    if (!selectedTopic) {
      return;
    }

    this.uploading.set(true);
    this.errorMessage.set('');
    this.transcription.set(null);

    this.speakingService.transcribeAudio(
      file,
      selectedTopic.id
    ).subscribe({

      next: (response) => {

        this.transcription.set(response);
        this.uploading.set(false);

      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message ||
          'Unable to process your recording.'
        );

        this.uploading.set(false);

      }

    });

  }

  // EVALUATE SPEAKING ATTEMPT
  evaluateSpeaking(): void {

    const result = this.transcription();

    if (!result || this.evaluating()) {
      return;
    }

    this.evaluating.set(true);
    this.errorMessage.set('');

    this.evaluationService.evaluateAttempt(
      result.attempt.id
    ).subscribe({

      next: (response) => {

        this.router.navigate(
          [
            '/student/english-practice/result',
            response.attempt_id
          ],
          {
            state: {
              evaluation: response.evaluation
            }
          }
        );

      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message ||
          'Unable to evaluate your speaking attempt.'
        );

        this.evaluating.set(false);

      }

    });

  }

}
