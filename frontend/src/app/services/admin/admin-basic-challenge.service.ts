import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminBasicChallengeService {

  private apiUrl = 'http://localhost:5000/api/admin/basic-challenge';

  constructor(private http: HttpClient) {}

  // Preview Excel / CSV
  previewQuestions(file: File) {

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(
      `${this.apiUrl}/import/preview`,
      formData
    );
  }

  // Confirm and save questions
  confirmImport(subtopicId: number, questions: any[]) {

    return this.http.post(
      `${this.apiUrl}/${subtopicId}/import/confirm`,
      {
        questions
      }
    );
  }
}