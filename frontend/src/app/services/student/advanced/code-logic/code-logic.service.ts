
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StudentCodeLogicProblem {
  id: number;
  title: string;
  description: string;
  mode: 'build_code' | 'understand_code';
  difficulty: 'easy' | 'medium' | 'hard';
  max_marks: number;
  language_id: number;
  language_name: string;
  publish_date: string | null;
  due_date: string | null;
  status?: string;
}

export interface StudentCodeLogicProblemDetails
  extends StudentCodeLogicProblem {
  hint_text?: string | null;
  input_description?: string | null;
  output_description?: string | null;
  examples?: any[] | string;
  starter_code?: string | null;
  solution_code?: string | null;
  algorithm_steps?: any[] | string;
  prediction_questions?: any[] | string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentCodeLogicService {
  private readonly apiUrl =
    'http://localhost:5000/api/student/advanced/code-logic';

  constructor(private http: HttpClient) {}

  // Get all published problems
  getPublishedProblems(): Observable<any> {
    return this.http.get(`${this.apiUrl}/problems`);
  }

  // Get one published problem
  getProblemDetails(problemId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/problems/${problemId}`
    );
  }

  // Start or resume an attempt
  startAttempt(problemId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/problems/${problemId}/start`,
      {}
    );
  }

  // Submit a solution
  submitAttempt(
    problemId: number,
    payload: any
  ): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/problems/${problemId}/submit`,
      payload
    );
  }

  // Get attempt history
  getAttemptHistory(problemId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/problems/${problemId}/attempts`
    );
  }

  // Get a hint for the active attempt
  getHint(problemId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/problems/${problemId}/hint`
    );
  }
}
