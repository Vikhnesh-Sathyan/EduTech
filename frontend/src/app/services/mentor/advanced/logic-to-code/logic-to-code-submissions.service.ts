import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// =====================================================
// SUBMISSION MODEL
// =====================================================

export interface LogicToCodeSubmission {
  id: number;
  problem_id: number;
  problem_title: string;
  student_id: number;
  student_name: string;
  language: string;
  execution_status: string;
  passed_test_cases: number;
  total_test_cases: number;
  execution_time_ms: number;
  submitted_at: string;
  review_status: string;
  mentor_feedback: string | null;
}

// =====================================================
// PAGINATION MODEL
// =====================================================

export interface SubmissionPagination {
  currentPage: number;
  limit: number;
  totalSubmissions: number;
  totalPages: number;
}

// =====================================================
// API RESPONSE MODEL
// =====================================================

export interface MentorSubmissionsResponse {
  success: boolean;
  message: string;
  pagination: SubmissionPagination;
  submissions: LogicToCodeSubmission[];
}

export interface LogicToCodeTestResult {
  caseNumber: number;
  visibility: string;
  passed: boolean;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  error?: string;
}

export interface LogicToCodeSubmissionDetails
  extends LogicToCodeSubmission {
  difficulty: string;
  student_email: string;
  source_code: string;
  submission_number: number;
  memory_used_kb: number | null;
  error_message: string | null;
  test_results: LogicToCodeTestResult[];
  reviewed_at: string | null;
  star_rating: number | null;
}

export interface MentorSubmissionDetailsResponse {
  success: boolean;
  message: string;
  submission: LogicToCodeSubmissionDetails;
}

export interface MentorSubmissionFeedbackResponse {
  success: boolean;
  message: string;
}

// =====================================================
// LOGIC TO CODE SUBMISSIONS SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class LogicToCodeSubmissionsService {

  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:5000/api/mentor/advanced/logic-to-code';

  // =====================================================
  // GET MENTOR SUBMISSIONS
  // =====================================================

  getSubmissions(
    page: number = 1,
    limit: number = 10,
    status: string = '',
    language: string = '',
    search: string = ''
  ): Observable<MentorSubmissionsResponse> {

    return this.http.get<MentorSubmissionsResponse>(
      `${this.apiUrl}/submissions`,
      {
        params: {
          page: page.toString(),
          limit: limit.toString(),
          status,
          language,
          search
        }
      }
    );
  }

  getSubmissionDetails(
  submissionId: number
): Observable<MentorSubmissionDetailsResponse> {
  return this.http.get<MentorSubmissionDetailsResponse>(
    `${this.apiUrl}/submissions/${submissionId}`
  );
}

updateFeedback(
  submissionId: number,
  mentor_feedback: string,
  star_rating: number
): Observable<MentorSubmissionFeedbackResponse> {

  return this.http.patch<MentorSubmissionFeedbackResponse>(
    `${this.apiUrl}/submissions/${submissionId}/feedback`,
    {
      mentor_feedback,
      star_rating
    }
  );
}

}