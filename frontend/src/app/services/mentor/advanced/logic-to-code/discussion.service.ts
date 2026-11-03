
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// =====================================================
// INTERFACES
// =====================================================

export interface MentorDiscussion {
  id: number;
  problem_id: number;
  user_id: number;
  user_name: string;
  user_role: string;
  parent_id: number | null;
  content: string;
  is_edited: number;
  created_at: string;
  updated_at: string;
  is_deleted?: number;
  replies?: MentorDiscussion[];
}

export interface MentorDiscussionResponse {
  success: boolean;
  message: string;
  problem?: {
    id: number;
    title: string;
  };
  totalDiscussions: number;
  discussions: MentorDiscussion[];
}

export interface MentorReplyResponse {
  success: boolean;
  message: string;
  reply: {
    id: number;
    problem_id: number;
    user_id: number;
    parent_id: number;
    content: string;
  };
}

export interface MentorDiscussionReport {
  report_id: number;
  discussion_id: number;
  reporter_id: number;
  reporter_name: string;
  reason: string;
  description: string | null;
  status: 'pending' | 'action_taken' | 'dismissed';
  reviewed_by: number | null;
  reviewer_name: string | null;
  reviewed_at: string | null;
  reported_at: string;

  discussion_content: string;
  discussion_author_id: number;
  discussion_author_name: string;
  discussion_author_role: string;
  is_deleted: number;

  problem_id: number;
  problem_title: string;
}

export interface MentorDiscussionReportsResponse {
  success: boolean;
  message: string;
  pagination: {
    currentPage: number;
    limit: number;
    totalReports: number;
    totalPages: number;
  };
  reports: MentorDiscussionReport[];
}

export interface ReviewDiscussionReportResponse {
  success: boolean;
  message: string;
  report: {
    id: number;
    status: 'action_taken' | 'dismissed';
    reviewed_by: number;
  };
}

// =====================================================
// MENTOR DISCUSSION SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class MentorDiscussionService {

  private http = inject(HttpClient);

  private apiUrl =
  'http://localhost:5000/api/mentor/advanced/logic-to-code';

  // =====================================================
  // GET PROBLEM DISCUSSIONS
  // =====================================================

  getDiscussions(
    problemId: number
  ): Observable<MentorDiscussionResponse> {

    return this.http.get<MentorDiscussionResponse>(
      `${this.apiUrl}/${problemId}/discussions`
    );

  }

  // =====================================================
  // REPLY TO DISCUSSION
  // =====================================================

  replyToDiscussion(
    problemId: number,
    discussionId: number,
    content: string
  ): Observable<MentorReplyResponse> {

    return this.http.post<MentorReplyResponse>(
      `${this.apiUrl}/${problemId}/discussions/${discussionId}/replies`,
      { content }
    );

  }

  // =====================================================
  // DELETE DISCUSSION
  // =====================================================

  deleteDiscussion(
    problemId: number,
    discussionId: number
  ): Observable<{ success: boolean; message: string }> {

    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/${problemId}/discussions/${discussionId}`
    );

  }

  // =====================================================
  // GET DISCUSSION REPORTS
  // =====================================================

  getDiscussionReports(
    status: string = '',
    page: number = 1,
    limit: number = 10
  ): Observable<MentorDiscussionReportsResponse> {

    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<MentorDiscussionReportsResponse>(
      `${this.apiUrl}/discussion-reports`,
      { params }
    );

  }

  // =====================================================
  // REVIEW DISCUSSION REPORT
  // =====================================================

  reviewDiscussionReport(
    reportId: number,
    status: 'action_taken' | 'dismissed'
  ): Observable<ReviewDiscussionReportResponse> {

    return this.http.patch<ReviewDiscussionReportResponse>(
      `${this.apiUrl}/discussion-reports/${reportId}/review`,
      { status }
    );

  }

  // =====================================================
// DELETE REPORTED DISCUSSION
// =====================================================

deleteReportedDiscussion(
  problemId: number,
  discussionId: number
): Observable<{ success: boolean; message: string }> {

  return this.http.delete<{ success: boolean; message: string }>(
    `${this.apiUrl}/${problemId}/discussions/${discussionId}`
  );

}

}
