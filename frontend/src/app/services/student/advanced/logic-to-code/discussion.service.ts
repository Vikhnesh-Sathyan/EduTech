
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// =====================================================
// DISCUSSION INTERFACES
// =====================================================

export interface StudentDiscussion {
  id: number;
  problem_id: number;
  user_id: number;
  parent_id: number | null;
  content: string;
  user_name: string;
  user_role: string;
  is_edited: number;
  is_deleted: number;
  created_at: string;
  updated_at: string;
  replies?: StudentDiscussion[];
}

export interface DiscussionResponse {
  success: boolean;
  message?: string;
  count: number;
  discussions: StudentDiscussion[];
}

export interface SingleDiscussionResponse {
  success: boolean;
  message: string;
  data: StudentDiscussion;
}

// =====================================================
// DISCUSSION SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class DiscussionService {

  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:5000/api/student/logic-to-code';

  // =====================================================
  // GET DISCUSSIONS
  // =====================================================

  getDiscussions(problemId: number): Observable<DiscussionResponse> {
    return this.http.get<DiscussionResponse>(
      `${this.apiUrl}/problems/${problemId}/discussions`
    );
  }

  // =====================================================
  // CREATE DISCUSSION OR REPLY
  // =====================================================

  createDiscussion(
    problemId: number,
    content: string,
    parent_id: number | null = null
  ): Observable<SingleDiscussionResponse> {

    return this.http.post<SingleDiscussionResponse>(
      `${this.apiUrl}/problems/${problemId}/discussions`,
      {
        content,
        parent_id
      }
    );
  }

  // =====================================================
  // UPDATE OWN DISCUSSION
  // =====================================================

  updateDiscussion(
    discussionId: number,
    content: string
  ): Observable<SingleDiscussionResponse> {

    return this.http.put<SingleDiscussionResponse>(
      `${this.apiUrl}/discussions/${discussionId}`,
      { content }
    );
  }

  // =====================================================
  // DELETE OWN DISCUSSION
  // =====================================================

  deleteDiscussion(
    discussionId: number
  ): Observable<SingleDiscussionResponse> {

    return this.http.delete<SingleDiscussionResponse>(
      `${this.apiUrl}/discussions/${discussionId}`
    );
  }

  // =====================================================
  // REPORT DISCUSSION
  // =====================================================

  reportDiscussion(
    discussionId: number,
    reason: string,
    description: string = ''
  ): Observable<SingleDiscussionResponse> {

    return this.http.post<SingleDiscussionResponse>(
      `${this.apiUrl}/discussions/${discussionId}/report`,
      {
        reason,
        description
      }
    );
  }

}
