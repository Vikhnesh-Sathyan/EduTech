import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StudentBasicChallengeService {

  private apiUrl =
    'http://localhost:5000/api/student/basic-challenge';

  constructor(private http: HttpClient) {}

  // Get 5 random challenge questions
  getQuestions(subtopicId: number) {
    return this.http.get(
      `${this.apiUrl}/${subtopicId}/questions`
    );
  }

  // Get challenge status and Advanced unlock status
  getChallengeStatus(subtopicId: number) {
    return this.http.get(
      `${this.apiUrl}/${subtopicId}/status`
    );
  }

  // Submit answers for server-side evaluation
  submitChallenge(
    subtopicId: number,
    answers: {
      questionId: number;
      selectedAnswer: string;
      confidence: string;
    }[]
  ) {
    return this.http.post(
      `${this.apiUrl}/${subtopicId}/submit`,
      { answers }
    );
  }
}
