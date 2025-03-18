import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-eng-practise',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './eng-practise.component.html',
  styleUrls: ['./eng-practise.component.css'],
})
export class EngPractiseComponent {
  title = 'English Speaking Practice';
  isRecording = false;
  recognition: any;
  spokenText = '';
  fillerWords = ['ah', 'um', 'mm', 'uh', 'like', 'so'];
  fillerCount: { [key: string]: number } = {};
  feedbackMessage = '';
  sessionEnded = false;
  speechRating = 5;
  mediaRecorder: any;
  audioChunks: any[] = [];
  fiveMinuteTimer: any;

  constructor(private cdRef: ChangeDetectorRef) {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'en-US';
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      this.recognition.onresult = (event: any) => {
        let newTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          newTranscript += event.results[i][0].transcript + ' ';
        }
        this.spokenText = newTranscript.trim();
        this.detectFillerWords();
        this.cdRef.detectChanges();
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech Recognition Error:', event.error);
        this.isRecording = false;
      };

      this.recognition.onend = () => {
        if (this.isRecording) {
          console.log('Restarting speech recognition...');
          this.recognition.start();
        }
      };
    } else {
      console.warn('SpeechRecognition API is not supported in this browser.');
    }
  }

  toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  startRecording() {
    if (!this.recognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    this.isRecording = true;
    this.spokenText = '';
    this.fillerCount = {};
    this.feedbackMessage = '';
    this.sessionEnded = false;
    this.recognition.start();

    this.fiveMinuteTimer = setTimeout(() => {
      this.stopRecording();
    }, 5 * 60 * 1000);

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.start();

      this.mediaRecorder.ondataavailable = (event: any) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        this.downloadAudio();
      };
    });
  }

  stopRecording() {
    if (!this.recognition) return;

    this.isRecording = false;
    this.recognition.stop();
    this.sessionEnded = true;
    this.calculateRating();

    clearTimeout(this.fiveMinuteTimer);

    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    }
  }

  downloadAudio() {
    const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = 'speech-recording.wav';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  detectFillerWords() {
    this.fillerCount = {};
    const words = this.spokenText.toLowerCase().split(/\s+/);
    words.forEach((word) => {
      if (this.fillerWords.includes(word)) {
        this.fillerCount[word] = (this.fillerCount[word] || 0) + 1;
      }
    });
    this.provideRealTimeFeedback();
  }

  provideRealTimeFeedback() {
    const totalFillers = Object.values(this.fillerCount).reduce((acc, count) => acc + count, 0);

    if (totalFillers > 10) {
      this.feedbackMessage = 'Try to pause and think before speaking.';
    } else if (totalFillers > 5) {
      this.feedbackMessage = 'Good effort! Keep reducing filler words for smoother speech.';
    } else {
      this.feedbackMessage = 'Great job! Your speech is improving.';
    }
  }

  calculateRating() {
    const totalFillers = Object.values(this.fillerCount).reduce((acc, count) => acc + count, 0);
    if (totalFillers > 10) {
      this.speechRating = 2;
    } else if (totalFillers > 5) {
      this.speechRating = 3;
    } else {
      this.speechRating = 5;
    }
  }
}
