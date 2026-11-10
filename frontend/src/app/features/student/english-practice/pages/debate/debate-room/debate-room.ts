
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';

import { DebateService } from '../../../services/debate/debate.service';
import { DebateVoiceService } from '../../../services/debate/debate-voice.service';

import { DebateSession } from '../../../models/debate/debate.model';

@Component({
  selector: 'app-debate-room',
  standalone: true,
  imports: [FormsModule, TitleCasePipe],
  templateUrl: './debate-room.html',
  styleUrl: './debate-room.css',
})
export class DebateRoom implements OnInit {

  private debateService = inject(DebateService);
  private debateVoice = inject(DebateVoiceService);

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Session data
  sessionId = 0;

  session = signal<DebateSession | null>(null);

  // Argument input
  argumentText = signal('');

  // Loading states
  isLoading = signal(true);
  isSending = signal(false);
  isEvaluating = signal(false);

  // Voice states
  isListening = signal(false);
  liveTranscript = signal('');
  voiceError = signal('');

  // General error
  errorMessage = signal('');

  // Browser support
  isVoiceSupported = signal(false);

  ngOnInit(): void {

    this.isVoiceSupported.set(
      this.debateVoice.isRecognitionSupported()
    );

    this.sessionId = Number(
      this.route.snapshot.paramMap.get('sessionId')
    );

    if (!this.sessionId || isNaN(this.sessionId)) {

      this.errorMessage.set('Invalid debate session.');
      this.isLoading.set(false);

      return;
    }

    this.loadSession();

  }

  // Load debate session
  loadSession(): void {

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.debateService.getSessionDetails(this.sessionId).subscribe({

      next: (response) => {

        this.session.set(response.session);
        this.isLoading.set(false);

      },

      error: (error) => {

        this.isLoading.set(false);

        this.errorMessage.set(
          error.error?.message ||
          'Unable to load the debate session.'
        );

      }

    });

  }

  // Start microphone
  startRecording(): void {

    if (
      this.isListening() ||
      this.isSending() ||
      this.isEvaluating()
    ) {
      return;
    }

    this.voiceError.set('');
    this.liveTranscript.set('');

    this.isListening.set(true);

    this.debateVoice.startListening(

      // Speech transcription
      (text, isFinal) => {

        this.liveTranscript.set(text);

        if (isFinal && text) {

          const currentText = this.argumentText().trim();

          this.argumentText.set(
            currentText
              ? `${currentText} ${text}`
              : text
          );

          this.liveTranscript.set('');

        }

      },

      // Voice errors
      (message) => {

        this.voiceError.set(message);
        this.isListening.set(false);

      },

      // Microphone stopped
      () => {

        this.isListening.set(false);

      }

    );

  }

  // Stop microphone
  stopRecording(): void {

    this.debateVoice.stopListening();

    this.isListening.set(false);
    this.liveTranscript.set('');

  }

  // Stop AI voice
  stopAiVoice(): void {

    this.debateVoice.stopSpeaking();

  }

  // Send argument to AI
  sendArgument(): void {

    const argument = this.argumentText().trim();
    const currentSession = this.session();

    if (
      !argument ||
      this.isSending() ||
      this.isEvaluating() ||
      !currentSession
    ) {
      return;
    }

    if (currentSession.status !== 'active') {

      this.errorMessage.set(
        'This debate session is no longer active.'
      );

      return;
    }

    // Stop microphone before sending
    this.stopRecording();

    this.isSending.set(true);
    this.errorMessage.set('');
    this.voiceError.set('');

    this.debateService.sendArgument({

      sessionId: this.sessionId,
      studentArgument: argument

    }).subscribe({

      next: (response) => {

        this.argumentText.set('');
        this.isSending.set(false);

        // AI speaks its counterargument
        if (response.response) {
          this.debateVoice.speak(response.response);
        }

        // Refresh conversation
        this.loadSession();

      },

      error: (error) => {

        this.isSending.set(false);

        this.errorMessage.set(
          error.error?.message ||
          'Unable to send your argument. Please try again.'
        );

      }

    });

  }

  // Finish debate
  finishDebate(): void {

    const currentSession = this.session();

    if (
      !currentSession ||
      this.isEvaluating() ||
      this.isSending()
    ) {
      return;
    }

    if (currentSession.status !== 'active') {

      this.router.navigate([
        '/english-practice/debate/result',
        this.sessionId
      ]);

      return;
    }

    if (!currentSession.arguments?.length) {

      this.errorMessage.set(
        'Submit at least one argument before finishing.'
      );

      return;
    }

    this.stopRecording();
    this.stopAiVoice();

    this.isEvaluating.set(true);
    this.errorMessage.set('');

    this.debateService.evaluateSession({

      sessionId: this.sessionId

    }).subscribe({

      next: () => {

        this.isEvaluating.set(false);

        this.router.navigate([
          '/english-practice/debate/result',
          this.sessionId
        ]);

      },

      error: (error) => {

        this.isEvaluating.set(false);

        this.errorMessage.set(
          error.error?.message ||
          'Unable to evaluate the debate. Please try again.'
        );

      }

    });

  }

  // Return to dashboard
  goBack(): void {

    this.stopRecording();
    this.stopAiVoice();

    this.router.navigate([
      '/english-practice/debate'
    ]);

  }

}
