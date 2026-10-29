
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


export interface CodeLogicLanguage {
  id: number;
  name: string;
}

export interface CodeLogicConcept {
  id: number;
  name: string;
  description: string | null;
}

export interface CodeLogicExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface CodeLogicPredictionQuestion {
  question: string;
  expected_answer: string;
  marks: number;
}

export interface CodeLogicAssessmentQuestion {
  question: string;
  expected_answer: string;
  marks: number;
}

export interface CodeLogicContent {
  inputDescription: string;
  outputDescription: string;
  examples: CodeLogicExample[];
  starterCode: string;
  solutionCode: string;
  algorithmSteps: string[];
  flowData: unknown;
  predictionQuestions: CodeLogicPredictionQuestion[];
  assessmentQuestions: CodeLogicAssessmentQuestion[];
}


export interface CodeLogicProblemPayload {
  title: string;
  description: string;
  languageId: number;
  mode: 'build_code' | 'understand_code';
  difficulty: 'easy' | 'medium' | 'hard';
  maxMarks: number;
  hintText: string | null;
  publishDate: string | null;
  dueDate: string | null;
  content: CodeLogicContent;
}

export interface CodeLogicCSVImportResult {
  message: string;
  imported: number;
  failed: number;
  errors: {
    row: number;
    title: string;
    message: string;
  }[];
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

  
  // GET ACTIVE LANGUAGES
  getLanguages(): Observable<{ languages: CodeLogicLanguage[] }> {
    return this.http.get<{ languages: CodeLogicLanguage[] }>(
      `${this.apiUrl}/languages`
    );
  }

  // GET ACTIVE CONCEPTS
  getConcepts(): Observable<{ concepts: CodeLogicConcept[] }> {
    return this.http.get<{ concepts: CodeLogicConcept[] }>(
      `${this.apiUrl}/concepts`
    );
  }

  // CREATE A DRAFT PROBLEM
  createProblem(
    payload: CodeLogicProblemPayload
  ): Observable<{
    message: string;
    problemId: number;
    status: string;
  }> {
    return this.http.post<{
      message: string;
      problemId: number;
      status: string;
    }>(
      `${this.apiUrl}/problems`,
      payload
    );
  }

  // GET ONE PROBLEM WITH FULL CONTENT
getProblemById(problemId: number): Observable<{ problem: any }> {
  return this.http.get<{ problem: any }>(
    `${this.apiUrl}/problems/${problemId}`
  );
}

// UPDATE AN EXISTING DRAFT PROBLEM
updateProblem(
  problemId: number,
  payload: CodeLogicProblemPayload
): Observable<{
  message: string;
  problemId: number;
  status: string;
}> {
  return this.http.put<{
    message: string;
    problemId: number;
    status: string;
  }>(
    `${this.apiUrl}/problems/${problemId}`,
    payload
  );
}

// =====================================================
// IMPORT LOGIC TO CODE PROBLEMS FROM CSV
// =====================================================

importProblemsFromCSV(
  file: File
): Observable<CodeLogicCSVImportResult> {
  const formData = new FormData();

  formData.append('file', file);

  return this.http.post<CodeLogicCSVImportResult>(
    `${this.apiUrl}/problems/import-csv`,
    formData
  );
}
}
