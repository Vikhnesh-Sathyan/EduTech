
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

// =====================================================
// STUDENT PROBLEM INTERFACES
// =====================================================

export interface StudentLogicToCodeProblem {
  id: number;
  subject_id: number;
  subject_name: string;
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
// STUDENT SUBJECT INTERFACE
// =====================================================

export interface StudentLogicToCodeSubject {
  id: number;
  name: string;
}

export interface StudentLogicToCodeSubjectsResponse {
  success: boolean;
  message: string;
  data: StudentLogicToCodeSubject[];
}

// =====================================================
// STUDENT PROBLEM DETAILS INTERFACES
// =====================================================

export interface StudentLogicToCodeProblemDetails {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  solution_unlock: number;
  created_at: string;
  mentor_name: string;

  // Mentor-selected subject
  subject_id: number;
  subject_name: string;

  // Programming language
  programming_language: string;
  language_label: string;
}

export interface StudentLogicToCodeStep {
  id: number;
  step_number: number;
  step_description: string;
}

export interface StudentLogicToCodeSupport {
  sample_code_title: string | null;
  sample_code_description: string | null;
  sample_code: string | null;
  sample_code_language: string | null;
  starter_code: string | null;
  starter_code_language: string | null;
}

export interface StudentLogicToCodeReferenceSolution {
  id: number;
  language: string;
  solution_code: string;
  solution_explanation: string | null;
}

export interface StudentLogicToCodeHint {
  id: number;
  hint_number: number;
  hint_content: string;
}

export interface StudentLogicToCodeMistake {
  id: number;
  mistake_title: string;
  mistake_description: string;
}

export interface StudentLogicToCodePublicTestCase {
  id: number;
  case_number: number;
  test_input: string;
  expected_output: string;
}

export interface StudentLogicToCodeProblemDetailsResponse {
  success: boolean;
  message: string;
  data: {
    problem: StudentLogicToCodeProblemDetails;
    steps: StudentLogicToCodeStep[];
    support: StudentLogicToCodeSupport | null;
    referenceSolution: StudentLogicToCodeReferenceSolution | null;
    hints: StudentLogicToCodeHint[];
    mistakes: StudentLogicToCodeMistake[];
    publicTestCases: StudentLogicToCodePublicTestCase[];
  };
}

// =====================================================
// CREATE CODE SUBMISSION
// =====================================================

export interface CreateStudentSubmissionResponse {
  success: boolean;
  message: string;
  data: {
    submissionId: number;
    problemId: number;
    language: string;
    submissionNumber: number;
    executionStatus: string;
  };
}

// =====================================================
// EXECUTE CODE SUBMISSION
// =====================================================

export interface ExecuteStudentSubmissionResponse {
  success: boolean;
  message: string;
  data: {
    submissionId: number;
    executionStatus: string;
    passedTestCases: number;
    totalTestCases: number;
    testResults: {
      caseNumber: number;
      visibility: string;
      passed: boolean;
    }[];
  };
}

// =====================================================
// STUDENT SUBMISSION DETAILS
// =====================================================

export interface StudentSubmissionDetails {
  id: number;
  problem_id: number;
  problem_title: string;
  difficulty: string;
  language: string;
  source_code: string;
  submission_number: number;
  execution_status: string;
  passed_test_cases: number;
  total_test_cases: number;
  execution_time_ms: number | null;
  memory_used_kb: number | null;
  error_message: string | null;
  test_results: any;
  mentor_feedback: string | null;
  star_rating: number | null;
  review_status: string;
  submitted_at: string;
  reviewed_at: string | null;
}

export interface StudentSubmissionDetailsResponse {
  success: boolean;
  message: string;
  data: StudentSubmissionDetails;
}

// =====================================================
// STUDENT SUBMISSION HISTORY
// =====================================================

export interface StudentProblemSubmission {
  id: number;
  problem_id: number;
  problem_title: string;
  difficulty: string;
  language: string;
  submission_number: number;
  execution_status: string;
  passed_test_cases: number;
  total_test_cases: number;
  execution_time_ms: number | null;
  memory_used_kb: number | null;
  error_message: string | null;
  mentor_feedback: string | null;
  star_rating: number | null;
  review_status: string;
  submitted_at: string;
  reviewed_at: string | null;
}

export interface StudentProblemSubmissionsResponse {
  success: boolean;
  message: string;
  data: StudentProblemSubmission[];
  pagination: {
    currentPage: number;
    limit: number;
    totalSubmissions: number;
    totalPages: number;
  };
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

  // =====================================================
  // GET PUBLISHED PROBLEMS
  // =====================================================

  getProblems(
    search: string = '',
    difficulty: string = '',
    page: number = 1,
    limit: number = 10,
    subjectId: number | string = ''
  ): Observable<StudentLogicToCodeProblemsResponse> {

    return this.http.get<StudentLogicToCodeProblemsResponse>(
      `${this.apiUrl}/problems`,
      {
        params: {
          search,
          difficulty,
          page,
          limit,
          subjectId
        }
      }
    );

  }

  // =====================================================
  // GET AVAILABLE SUBJECTS
  // =====================================================

  getAvailableSubjects(): Observable<StudentLogicToCodeSubjectsResponse> {

    return this.http.get<StudentLogicToCodeSubjectsResponse>(
      `${this.apiUrl}/subjects`
    );

  }

  // =====================================================
  // GET SINGLE PROBLEM DETAILS
  // =====================================================

  getProblemDetails(
    problemId: number
  ): Observable<StudentLogicToCodeProblemDetailsResponse> {

    return this.http.get<StudentLogicToCodeProblemDetailsResponse>(
      `${this.apiUrl}/problems/${problemId}`
    );

  }

  // =====================================================
  // CREATE STUDENT SUBMISSION
  // =====================================================

  createSubmission(
    problemId: number,
    language: string,
    source_code: string
  ): Observable<CreateStudentSubmissionResponse> {

    return this.http.post<CreateStudentSubmissionResponse>(
      `${this.apiUrl}/problems/${problemId}/submissions`,
      {
        language,
        source_code
      }
    );

  }

  // =====================================================
  // EXECUTE STUDENT SUBMISSION
  // =====================================================

  executeSubmission(
    submissionId: number
  ): Observable<ExecuteStudentSubmissionResponse> {

    return this.http.post<ExecuteStudentSubmissionResponse>(
      `${this.apiUrl}/submissions/${submissionId}/execute`,
      {}
    );

  }

  // =====================================================
  // GET STUDENT SUBMISSION DETAILS
  // =====================================================

  getSubmissionDetails(
    submissionId: number
  ): Observable<StudentSubmissionDetailsResponse> {

    return this.http.get<StudentSubmissionDetailsResponse>(
      `${this.apiUrl}/submissions/${submissionId}`
    );

  }
// =====================================================
// GET STUDENT SUBMISSION HISTORY
// =====================================================

getSubmissionHistory(
  problemId?: number,
  page: number = 1,
  limit: number = 10
): Observable<StudentProblemSubmissionsResponse> {

  let params: any = { page, limit };

  if (problemId) {
    params.problemId = problemId;
  }

  return this.http.get<StudentProblemSubmissionsResponse>(
    `${this.apiUrl}/submissions`,
    { params }
  );
}
}
