import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  SpeakingTranscriptionResponse
} from '../../models/speaking/speaking-transcription.model';

import {
  SpeakingHistoryResponse
} from '../../models/speaking/speaking-attempt.model';

@Injectable({
  providedIn: 'root'
})
export class SpeakingService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:5000/api/english-practice/speech';

  // TRANSCRIBE RECORDED AUDIO
  transcribeAudio(
    file: File,
    topicId: number
  ): Observable<SpeakingTranscriptionResponse> {

    const formData = new FormData();

    formData.append('file', file);
    formData.append('topic_id', topicId.toString());

    return this.http.post<SpeakingTranscriptionResponse>(
      `${this.apiUrl}/transcribe`,
      formData
    );
  }

  // GET STUDENT SPEAKING HISTORY
  getHistory(): Observable<SpeakingHistoryResponse> {

    return this.http.get<SpeakingHistoryResponse>(
      `${this.apiUrl}/history`
    );
  }

}