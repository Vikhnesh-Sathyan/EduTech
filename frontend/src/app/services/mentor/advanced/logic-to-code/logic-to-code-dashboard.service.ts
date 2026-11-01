
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// =====================================================
// DASHBOARD STATISTICS MODEL
// =====================================================

export interface LogicToCodeDashboardStatistics {
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
  statistics: LogicToCodeDashboardStatistics;
  recentSubmissions: LogicToCodeRecentSubmission[];
}

// =====================================================
// LOGIC TO CODE DASHBOARD SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class LogicToCodeDashboardService {

  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:5000/api/mentor/advanced/logic-to-code';

  // GET MENTOR DASHBOARD
  getDashboard(): Observable<LogicToCodeDashboardResponse> {
    return this.http.get<LogicToCodeDashboardResponse>(
      `${this.apiUrl}/dashboard`
    );
  }
}
