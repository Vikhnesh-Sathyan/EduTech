
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

export interface QuestionCategoryPayload {
  category_name: string;
  description?: string;
}

export interface CareerQuestionPayload {
  category_id: number;
  question_text: string;
  answer_text: string | null;
  explanation: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AdminCareerQuestions {

  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:5000/api/admin/career-hub/career-questions';

  private categoryApiUrl =
    'http://localhost:5000/api/admin/career-hub/career-question-categories';

  // ==========================================
  // QUESTION MANAGEMENT
  // ==========================================

  getQuestionFormData(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/form-data`
    );
  }

  getQuestions(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(this.apiUrl);
  }

  createQuestion(
    data: CareerQuestionPayload
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.apiUrl,
      data
    );
  }

  updateQuestion(
    id: number,
    data: CareerQuestionPayload
  ): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/${id}`,
      data
    );
  }

  archiveQuestion(id: number): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.apiUrl}/${id}/archive`,
      {}
    );
  }

  // ==========================================
  // QUESTION CATEGORY MANAGEMENT
  // ==========================================

  getQuestionCategories(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      this.categoryApiUrl
    );
  }

  createQuestionCategory(
    data: QuestionCategoryPayload
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.categoryApiUrl,
      data
    );
  }

  updateQuestionCategory(
    categoryId: number,
    data: QuestionCategoryPayload
  ): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.categoryApiUrl}/${categoryId}`,
      data
    );
  }

  toggleQuestionCategoryStatus(
    categoryId: number
  ): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.categoryApiUrl}/${categoryId}/status`,
      {}
    );
  }

}
