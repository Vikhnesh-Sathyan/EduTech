
import { Injectable } from '@angular/core';

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly [index: number]: {
    transcript: string;
  };
}

interface SpeechRecognitionEvent {
  readonly resultIndex: number;
  readonly results: ArrayLike<SpeechRecognitionResult>;
}

interface SpeechRecognitionErrorEvent {
  readonly error: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;

  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;

  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
}

@Injectable({
  providedIn: 'root'
})
export class DebateVoiceService {

  private recognition: SpeechRecognitionLike | null = null;

  // Check browser support
  isRecognitionSupported(): boolean {

    const browser = window as SpeechRecognitionWindow;

    return !!(
      browser.SpeechRecognition ||
      browser.webkitSpeechRecognition
    );

  }

  // Start microphone listening
  startListening(
    onTranscript: (text: string, isFinal: boolean) => void,
    onError: (message: string) => void,
    onEnd: () => void
  ): void {

    const browser = window as SpeechRecognitionWindow;

    const Recognition =
      browser.SpeechRecognition ||
      browser.webkitSpeechRecognition;

    if (!Recognition) {
      onError('Speech recognition is not supported in this browser.');
      return;
    }

    if (this.recognition) {
      this.stopListening();
    }

    const recognition = new Recognition();

    this.recognition = recognition;

    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {

      let transcript = '';
      let isFinal = false;

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {

        transcript += event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          isFinal = true;
        }

      }

      onTranscript(transcript.trim(), isFinal);

    };

    recognition.onerror = (event) => {

      const messages: Record<string, string> = {
        'not-allowed': 'Please allow microphone access.',
        'no-speech': 'No speech detected. Please try again.',
        'audio-capture': 'Microphone not found.',
        'network': 'Speech recognition network error.'
      };

      onError(
        messages[event.error] ||
        'Unable to recognize your speech. Please try again.'
      );

    };

    recognition.onend = () => {

      this.recognition = null;
      onEnd();

    };

    try {

      recognition.start();

    } catch {

      this.recognition = null;
      onError('Unable to start the microphone. Please try again.');

    }

  }

  // Stop microphone listening
  stopListening(): void {

    if (this.recognition) {

      this.recognition.stop();
      this.recognition = null;

    }

  }

  // AI text-to-speech
  speak(text: string): void {

    if (!('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = 'en-US';
    speech.rate = 0.95;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);

  }

  // Stop AI voice
  stopSpeaking(): void {

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

  }

}
