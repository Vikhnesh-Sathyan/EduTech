import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminDiagnostic {

  private apiUrl =
    'http://localhost:5000/api/admin/diagnostic-questions';


  constructor(
    private http: HttpClient
  ) {}


  // =====================================================
  // GET QUESTIONS
  // =====================================================

  getQuestions() {
    return this.http.get(
      this.apiUrl
    );
  }


  // =====================================================
  // GET SUBJECTS
  // =====================================================

  getSubjects() {
    return this.http.get(
      `${this.apiUrl}/subjects`
    );
  }


  // =====================================================
  // GET TOPICS
  // =====================================================

  getTopics(subjectId: number) {
    return this.http.get(
      `${this.apiUrl}/subjects/${subjectId}/topics`
    );
  }


  // =====================================================
  // CREATE QUESTION
  // =====================================================

  createQuestion(data: any) {
    return this.http.post(
      this.apiUrl,
      data
    );
  }


  // =====================================================
  // UPDATE QUESTION
  // =====================================================

  updateQuestion(
    questionId: number,
    data: any
  ) {
    return this.http.put(
      `${this.apiUrl}/${questionId}`,
      data
    );
  }

  
  // =====================================================
  // IMPORT DIAGNOSTIC QUESTIONS
  // =====================================================

  importQuestions(
    subjectId: number,
    topicId: number,
    file: File
  ) {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('subjectId', String(subjectId));
    formData.append('topicId', String(topicId));

    return this.http.post(
      `${this.apiUrl}/import`,
      formData
    );
  }

}