import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StudentDiagnostic {

  private apiUrl =
    'http://localhost:5000/api/diagnostic';

  constructor(
    private http: HttpClient
  ) {}

  // =====================================================
  // START DIAGNOSTIC
  // =====================================================

  startDiagnostic(subjectId: number) {
    return this.http.post(
      `${this.apiUrl}/subjects/${subjectId}/start`,
      {}
    );
  }

  // =====================================================
  // SUBMIT ANSWER
  // =====================================================

  submitAnswer(
    attemptId: number,
    questionId: number,
    selectedOption: string
  ) {
    return this.http.post(
      `${this.apiUrl}/${attemptId}/answer`,
      {
        questionId,
        selectedOption
      }
    );
  }

  // =====================================================
  // COMPLETE DIAGNOSTIC
  // =====================================================

  completeDiagnostic(
    attemptId: number
  ) {
    return this.http.post(
      `${this.apiUrl}/${attemptId}/complete`,
      {}
    );
  }

getDiagnosticResult(subjectId: number) {
  return this.http.get(
    `${this.apiUrl}/subjects/${subjectId}/result`
  );
}
}