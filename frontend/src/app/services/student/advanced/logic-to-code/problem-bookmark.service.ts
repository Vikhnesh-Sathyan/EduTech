
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// =====================================================
// BOOKMARK INTERFACE
// =====================================================

export interface BookmarkedProblem {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  mentor_name: string;
  bookmarked_at: string;
}

// =====================================================
// API RESPONSE INTERFACE
// =====================================================

export interface BookmarkedProblemsResponse {
  success: boolean;
  message: string;
  data: BookmarkedProblem[];
}

export interface BookmarkActionResponse {
  success: boolean;
  message: string;
}

// =====================================================
// BOOKMARK SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class ProblemBookmarkService {

  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:5000/api/student/logic-to-code';

  // =====================================================
  // GET BOOKMARKED PROBLEMS
  // =====================================================

  getBookmarkedProblems(): Observable<BookmarkedProblemsResponse> {
    return this.http.get<BookmarkedProblemsResponse>(
      `${this.apiUrl}/bookmarks`
    );
  }

  // =====================================================
  // ADD PROBLEM BOOKMARK
  // =====================================================

  addProblemBookmark(
    problemId: number
  ): Observable<BookmarkActionResponse> {
    return this.http.post<BookmarkActionResponse>(
      `${this.apiUrl}/problems/${problemId}/bookmark`,
      {}
    );
  }

  // =====================================================
  // REMOVE PROBLEM BOOKMARK
  // =====================================================

  removeProblemBookmark(
    problemId: number
  ): Observable<BookmarkActionResponse> {
    return this.http.delete<BookmarkActionResponse>(
      `${this.apiUrl}/problems/${problemId}/bookmark`
    );
  }

}
