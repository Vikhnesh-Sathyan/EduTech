
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// =====================================================
// DASHBOARD STATISTICS MODEL
// =====================================================

export interface LogicToCodeStatistics {
  totalProblems: number;
  publishedProblems: number;
  draftProblems: number;
  archivedProblems: number;
  totalAttempts: number;
  completedProblems: number;
  pendingDoubts: number;
}

// =====================================================
// RECENT SUBMISSION MODEL
// =====================================================

export interface LogicToCodeRecentSubmission {
  id: number;
  problem_id: number;
  problem_title: string;
  student_name: string;
  language: string;
  execution_status: string;
  passed_test_cases: number;
  total_test_cases: number;
  submitted_at: string;
}

// =====================================================
// DASHBOARD RESPONSE MODEL
// =====================================================

export interface LogicToCodeDashboardResponse {
  success: boolean;
  message: string;
  statistics: LogicToCodeStatistics;
  recentSubmissions: LogicToCodeRecentSubmission[];
}

// =====================================================
// LOGIC TO CODE PROBLEM MODEL
// =====================================================

export interface LogicToCodeProblem {
  id: number;
  mentor_id: number;

  subject_id: number;
  subject_name?: string;

  title: string;
  description: string;

  difficulty: 'easy' | 'medium' | 'hard';

  status: 'draft' | 'published' | 'archived';

  solution_unlock:
    | 'after_attempt'
    | 'after_completion'
    | 'mentor_only';

  created_at: string;
  updated_at: string;
}

// =====================================================
// PROBLEM LIST RESPONSE
// =====================================================

export interface LogicToCodeProblemsResponse {
  success: boolean;
  count: number;
  problems: LogicToCodeProblem[];
}

// =====================================================
// SINGLE PROBLEM RESPONSE
// =====================================================

export interface LogicToCodeProblemResponse {
  success: boolean;
  problem: LogicToCodeProblem;
}

export interface CreateLogicToCodeProblem {
  subject_id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  solution_unlock:
    | 'after_attempt'
    | 'after_completion'
    | 'mentor_only';
}

export interface CreateLogicToCodeProblemResponse {
  success: boolean;
  message: string;
  problemId: number;
}

// =====================================================
// UPDATE LOGIC TO CODE PROBLEM MODEL
// =====================================================

export interface UpdateLogicToCodeProblem {
  subject_id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  solution_unlock:
    | 'after_attempt'
    | 'after_completion'
    | 'mentor_only';
}

export interface UpdateLogicToCodeProblemResponse {
  success: boolean;
  message: string;
  problem: LogicToCodeProblem;
}

// =====================================================
// LOGIC TO CODE SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class LogicToCodeService {

  private http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:5000/api/mentor/advanced/logic-to-code';

  // GET MENTOR LOGIC TO CODE DASHBOARD
  getDashboard(): Observable<LogicToCodeDashboardResponse> {
    return this.http.get<LogicToCodeDashboardResponse>(
      `${this.apiUrl}/dashboard`
    );
  }

  // =====================================================
// GET ALL MENTOR PROBLEMS
// =====================================================

getMyProblems(): Observable<LogicToCodeProblemsResponse> {
  return this.http.get<LogicToCodeProblemsResponse>(
    this.apiUrl
  );
}

// =====================================================
// GET ONE PROBLEM BY ID
// =====================================================

getProblemById(
  problemId: number
): Observable<LogicToCodeProblemResponse> {
  return this.http.get<LogicToCodeProblemResponse>(
    `${this.apiUrl}/${problemId}`
  );
}

createProblem(
  data: CreateLogicToCodeProblem
): Observable<CreateLogicToCodeProblemResponse> {
  return this.http.post<CreateLogicToCodeProblemResponse>(
    this.apiUrl,
    data
  );
}

// =====================================================
// UPDATE EXISTING PROBLEM
// =====================================================

updateProblem(
  problemId: number,
  data: UpdateLogicToCodeProblem
): Observable<UpdateLogicToCodeProblemResponse> {
  return this.http.put<UpdateLogicToCodeProblemResponse>(
    `${this.apiUrl}/${problemId}`,
    data
  );
}

deleteProblem(problemId: number): Observable<{ success: boolean; message: string }> {
  return this.http.delete<{ success: boolean; message: string }>(
    `${this.apiUrl}/${problemId}`
  );
}

}
