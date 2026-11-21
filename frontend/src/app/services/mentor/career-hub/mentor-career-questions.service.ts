
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ==========================================
// INTERFACES
// ==========================================

export interface CareerQuestionCategory {
  id: number;
  category_name: string;
  description: string | null;
}

export interface CareerQuestionFormData {
  // API returns the categories array directly inside data
  [index: number]: CareerQuestionCategory;
}

export interface CareerQuestion {
  id: number;
  category_id: number;
  category_name: string;
  question_text: string;
  answer_text: string | null;
  explanation: string | null;
  created_by: number;
  contributor_name: string;
  contributor_role: string;
  status: 'published' | 'archived';
  created_at: string;
}

export interface SubmitCareerQuestion {
  category_id: number;
  question_text: string;
  answer_text?: string | null;
  explanation?: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ==========================================
// MENTOR CAREER QUESTIONS SERVICE
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class MentorCareerQuestionsService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5000/api/mentor/career-hub';

  // ==========================================
  // GET QUESTION FORM DATA
  // ==========================================

  getQuestionFormData(): Observable<ApiResponse<CareerQuestionCategory[]>> {

    return this.http.get<ApiResponse<CareerQuestionCategory[]>>(
      `${this.apiUrl}/career-questions/form-data`
    );

  }

  // ==========================================
  // SUBMIT CAREER QUESTION
  // ==========================================

  submitCareerQuestion(
    data: SubmitCareerQuestion
  ): Observable<ApiResponse<{ question_id: number; status: string }>> {

    return this.http.post<ApiResponse<{ question_id: number; status: string }>>(
      `${this.apiUrl}/career-questions`,
      data
    );

  }

  // ==========================================
  // GET CAREER QUESTIONS
  // ==========================================

  getCareerQuestions(): Observable<ApiResponse<CareerQuestion[]>> {

    return this.http.get<ApiResponse<CareerQuestion[]>>(
      `${this.apiUrl}/career-questions`
    );

  }

}
