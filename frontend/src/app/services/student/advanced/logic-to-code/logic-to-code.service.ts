
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// =====================================================
// STUDENT DASHBOARD INTERFACES
// =====================================================

export interface StudentLogicToCodeStatistics {
  attemptedProblems: number;
  completedProblems: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  pendingFeedback: number;
  totalBookmarks: number;
}

export interface StudentDifficultyProgress {
  difficulty: string;
  attempted: number;
  completed: number;
}

export interface StudentRecentSubmission {
  id: number;
  problem_id: number;
  problem_title: string;
  difficulty: string;
  language: string;
  execution_status: string;
  passed_test_cases: number;
  total_test_cases: number;
  submitted_at: string;
}

export interface StudentLogicToCodeDashboardResponse {
  success: boolean;
  message: string;
  data: {
    statistics: StudentLogicToCodeStatistics;
    difficultyProgress: StudentDifficultyProgress[];
    recentSubmissions: StudentRecentSubmission[];
  };
}

export interface StudentLogicToCodeProblem {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  created_at: string;
  mentor_name: string;
}

export interface StudentLogicToCodePagination {
  currentPage: number;
  limit: number;
  totalProblems: number;
  totalPages: number;
}

export interface StudentLogicToCodeProblemsResponse {
  success: boolean;
  message: string;
  data: StudentLogicToCodeProblem[];
  pagination: StudentLogicToCodePagination;
}

// =====================================================
// STUDENT LOGIC TO CODE SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class LogicToCodeService {

  private http = inject(HttpClient);

  private apiUrl =
  'http://localhost:5000/api/student/logic-to-code';

  // =====================================================
  // GET STUDENT DASHBOARD
  // =====================================================

  getDashboard(): Observable<StudentLogicToCodeDashboardResponse> {
    return this.http.get<StudentLogicToCodeDashboardResponse>(
      `${this.apiUrl}/dashboard`
    );
  }

  getProblems(
  search: string = '',
  difficulty: string = '',
  page: number = 1,
  limit: number = 10
): Observable<StudentLogicToCodeProblemsResponse> {

  return this.http.get<StudentLogicToCodeProblemsResponse>(
    `${this.apiUrl}/problems`,
    {
      params: {
        search,
        difficulty,
        page,
        limit
      }
    }
  );

}
}
