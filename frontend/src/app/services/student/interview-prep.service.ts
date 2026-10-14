import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type InterviewPrepType =
  | 'technical_question'
  | 'coding_challenge'
  | 'hr_question'
  | 'interview_experience'
  | 'preparation_tip';

export type InterviewPrepDifficulty =
  | 'beginner'
  | 'intermediate'
  | 'advanced';

export interface InterviewPrep {
  id: number;
  student_id: number;
  subject_id: number | null;
  title: string;
  description: string | null;
  prep_type: InterviewPrepType;
  content: string;
  difficulty: InterviewPrepDifficulty | null;
  subject_name?: string | null;
  student_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InterviewPrepPayload {
  subject_id?: number | null;
  title: string;
  description?: string | null;
  prep_type: InterviewPrepType;
  content: string;
  difficulty?: InterviewPrepDifficulty | null;
}

export interface InterviewPrepFilters {
  prep_type?: InterviewPrepType | '';
  subject_id?: number | null;
  difficulty?: InterviewPrepDifficulty | '';
  search?: string;
  sort?: 'newest' | 'oldest';
}

@Injectable({
  providedIn: 'root'
})
export class InterviewPrepService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:5000/api/recommendation/interview-prep';

  // Get all posts, optionally applying filters.
  getAll(filters: InterviewPrepFilters = {}): Observable<InterviewPrep[]> {
    let params = new HttpParams();

    if (filters.prep_type) {
      params = params.set('prep_type', filters.prep_type);
    }

    if (filters.subject_id != null) {
      params = params.set('subject_id', filters.subject_id);
    }

    if (filters.difficulty) {
      params = params.set('difficulty', filters.difficulty);
    }

    if (filters.search?.trim()) {
      params = params.set('search', filters.search.trim());
    }

    if (filters.sort) {
      params = params.set('sort', filters.sort);
    }

    return this.http.get<InterviewPrep[]>(this.apiUrl, { params });
  }

  // Get posts created by the logged-in student.
  getMyPosts(): Observable<InterviewPrep[]> {
    return this.http.get<InterviewPrep[]>(`${this.apiUrl}/my`);
  }

  // Get one post by ID.
  getById(id: number): Observable<InterviewPrep> {
    return this.http.get<InterviewPrep>(`${this.apiUrl}/${id}`);
  }

  // Create a new post.
  create(payload: InterviewPrepPayload): Observable<{ message: string; id: number }> {
    return this.http.post<{ message: string; id: number }>(
      this.apiUrl,
      payload
    );
  }

  // Update an existing post.
  update(
    id: number,
    payload: InterviewPrepPayload
  ): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/${id}`,
      payload
    );
  }

  // Delete an existing post.
  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${id}`
    );
  }
}