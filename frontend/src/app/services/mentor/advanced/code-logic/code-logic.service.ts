
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CodeLogicProblem {
  id: number;
  title: string;
  description: string;
  mode: 'build_code' | 'understand_code';
  difficulty: 'easy' | 'medium' | 'hard';
  max_marks: number;
  publish_date: string | null;
  due_date: string | null;
  language_id: number;
  language_name: string;
  status: 'draft' | 'published' | 'inactive';
}

export interface CodeLogicResponse {
  success: boolean;
  message?: string;
  problems?: CodeLogicProblem[];
}

@Injectable({
  providedIn: 'root'
})
export class CodeLogicService {

  private readonly apiUrl =
    'http://localhost:5000/api/mentor/advanced/code-logic';

  constructor(private http: HttpClient) {}

  // GET ALL PROBLEMS CREATED BY THE LOGGED-IN MENTOR
  getMyProblems(): Observable<CodeLogicResponse> {
    return this.http.get<CodeLogicResponse>(
      `${this.apiUrl}/problems`
    );
  }

  // PUBLISH A DRAFT PROBLEM
  publishProblem(problemId: number): Observable<CodeLogicResponse> {
    return this.http.patch<CodeLogicResponse>(
      `${this.apiUrl}/problems/${problemId}/publish`,
      {}
    );
  }

  // UNPUBLISH A PROBLEM
  unpublishProblem(problemId: number): Observable<CodeLogicResponse> {
    return this.http.patch<CodeLogicResponse>(
      `${this.apiUrl}/problems/${problemId}/unpublish`,
      {}
    );
  }

  // DEACTIVATE A PROBLEM
  deactivateProblem(problemId: number): Observable<CodeLogicResponse> {
    return this.http.patch<CodeLogicResponse>(
      `${this.apiUrl}/problems/${problemId}/deactivate`,
      {}
    );
  }

  // REACTIVATE A PROBLEM
  reactivateProblem(problemId: number): Observable<CodeLogicResponse> {
    return this.http.patch<CodeLogicResponse>(
      `${this.apiUrl}/problems/${problemId}/reactivate`,
      {}
    );
  }

  // DELETE A DRAFT PROBLEM
  deleteProblem(problemId: number): Observable<CodeLogicResponse> {
    return this.http.delete<CodeLogicResponse>(
      `${this.apiUrl}/problems/${problemId}`
    );
  }
}
