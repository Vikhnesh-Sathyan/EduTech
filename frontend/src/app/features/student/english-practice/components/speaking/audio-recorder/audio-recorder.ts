
import {
  Component,
  output,
  signal,
  OnDestroy
} from '@angular/core';

@Component({
  selector: 'app-audio-recorder',
  imports: [],
  templateUrl: './audio-recorder.html',
  styleUrl: './audio-recorder.css'
})
export class AudioRecorder implements OnDestroy {

  readonly recordingComplete = output<File>();

  readonly isRecording = signal(false);
  readonly errorMessage = signal('');

  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: BlobPart[] = [];
  private mediaStream: MediaStream | null = null;

  // START MICROPHONE RECORDING
  async startRecording(): Promise<void> {

    this.errorMessage.set('');

    try {

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          'Microphone access is not supported by this browser.'
        );
      }

      if (!window.MediaRecorder) {
        throw new Error(
          'Audio recording is not supported by this browser.'
        );
      }

      this.mediaStream =
        await navigator.mediaDevices.getUserMedia({
          audio: true
        });

      const mimeType = [
        'audio/webm;codecs=opus',
        'audio/webm'
      ].find(type => MediaRecorder.isTypeSupported(type));

      if (!mimeType) {
        throw new Error(
          'WebM audio recording is not supported by this browser.'
        );
      }

      this.audioChunks = [];

      this.mediaRecorder = new MediaRecorder(
        this.mediaStream,
        { mimeType }
      );

      this.mediaRecorder.ondataavailable = (event) => {

        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }

      };

      this.mediaRecorder.onstop = () => {

        const audioBlob = new Blob(
          this.audioChunks,
          { type: mimeType }
        );

        const audioFile = new File(
          [audioBlob],
          `speaking-${Date.now()}.webm`,
          { type: mimeType }
        );

        this.recordingComplete.emit(audioFile);

        this.stopMicrophone();

        this.mediaRecorder = null;
        this.audioChunks = [];

      };

      this.mediaRecorder.start();

      this.isRecording.set(true);

    } catch (error) {

      this.stopMicrophone();

      this.mediaRecorder = null;
      this.isRecording.set(false);

      this.errorMessage.set(
        error instanceof Error
          ? error.message
          : 'Unable to access the microphone.'
      );

    }

  }

  // STOP MICROPHONE RECORDING
  stopRecording(): void {

    if (
      this.mediaRecorder &&
      this.mediaRecorder.state === 'recording'
    ) {

      this.mediaRecorder.stop();

      this.isRecording.set(false);

    }

  }

  // RELEASE MICROPHONE
  private stopMicrophone(): void {

    this.mediaStream
      ?.getTracks()
      .forEach(track => track.stop());

    this.mediaStream = null;

  }

  // CLEANUP WHEN COMPONENT IS DESTROYED
  ngOnDestroy(): void {

    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.stop();
    }

    this.stopMicrophone();

  }

}
