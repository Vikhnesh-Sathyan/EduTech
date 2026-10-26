import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ==================== REQUEST INTERFACES ====================

export interface ComparisonConceptInput {
  name: string;
}

export interface ComparisonCellInput {
  content: string;
}

export interface ComparisonCellSaveInput {
  conceptId: number;
  content: string;
  imageUrl?: string | null;
}

export interface ComparisonRowInput {
  pointTitle: string;
  cells: ComparisonCellInput[];
}

export interface ComparisonRowSaveInput {
  pointTitle: string;
  cells: ComparisonCellSaveInput[];
}

export interface UpdateComparisonConceptRequest {
  name: string;
}

export interface UpdateComparisonRowRequest
  extends ComparisonRowSaveInput {}

// ==================== RESPONSE INTERFACES ====================

export interface MentorComparison {
  id: number;
  title: string;
  description: string;
  subject_id: number;
  subject_name: string | null;
  status: 'draft' | 'published' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface MyComparisonsResponse {
  comparisons: MentorComparison[];
}

export interface ComparisonDetailConcept {
  id: number;
  name: string;
  display_order: number;
}

export interface ComparisonDetailCell {
  concept_id: number;
  content_text: string;
  image_url: string | null;
}

export interface ComparisonDetailRow {
  id: number;
  comparison_id: number;
  point_title: string;
  display_order: number;
  cells: ComparisonDetailCell[];
}

export interface ComparisonDetails {
  id: number;
  title: string;
  description: string;
  subject_id: number;
  subject_name: string | null;
  status: 'draft' | 'published' | 'inactive';
  created_at: string;
  updated_at: string;
  concepts: ComparisonDetailConcept[];
  rows: ComparisonDetailRow[];
}

export interface ComparisonDetailsResponse {
  comparison: ComparisonDetails;
}

export interface CreateComparisonRequest {
  title: string;
  description: string;
  subjectId: number;
  concepts: ComparisonConceptInput[];
  rows: ComparisonRowInput[];
}

export interface CreateComparisonResponse {
  message: string;
  comparisonId: number;
}

export interface ComparisonActionResponse {
  message: string;
  conceptId?: number;
  rowId?: number;
}

// ==================== SERVICE ====================

@Injectable({
  providedIn: 'root'
})
export class ConceptComparisonService {
  private readonly apiUrl =
    'http://localhost:5000/api/mentor/advanced/concept-comparisons';

  constructor(private http: HttpClient) {}

  // ==================== COMPARISONS ====================

  createComparison(
    data: CreateComparisonRequest
  ): Observable<CreateComparisonResponse> {
    return this.http.post<CreateComparisonResponse>(
      this.apiUrl,
      data
    );
  }

  getMyComparisons(): Observable<MyComparisonsResponse> {
    return this.http.get<MyComparisonsResponse>(
      `${this.apiUrl}/mine`
    );
  }

  getComparisonById(
    id: number
  ): Observable<ComparisonDetailsResponse> {
    return this.http.get<ComparisonDetailsResponse>(
      `${this.apiUrl}/${id}`
    );
  }

  // ==================== CONCEPTS ====================

  addComparisonConcept(
    comparisonId: number,
    data: ComparisonConceptInput
  ): Observable<ComparisonActionResponse> {
    return this.http.post<ComparisonActionResponse>(
      `${this.apiUrl}/${comparisonId}/concepts`,
      data
    );
  }

  updateComparisonConcept(
    conceptId: number,
    data: UpdateComparisonConceptRequest
  ): Observable<ComparisonActionResponse> {
    return this.http.put<ComparisonActionResponse>(
      `${this.apiUrl}/concepts/${conceptId}`,
      data
    );
  }

  deleteComparisonConcept(
    conceptId: number
  ): Observable<ComparisonActionResponse> {
    return this.http.delete<ComparisonActionResponse>(
      `${this.apiUrl}/concepts/${conceptId}`
    );
  }

  // ==================== COMPARISON ROWS ====================

  addComparisonRow(
    comparisonId: number,
    data: ComparisonRowSaveInput
  ): Observable<ComparisonActionResponse> {
    return this.http.post<ComparisonActionResponse>(
      `${this.apiUrl}/${comparisonId}/rows`,
      data
    );
  }

  updateComparisonRow(
    rowId: number,
    data: UpdateComparisonRowRequest
  ): Observable<ComparisonActionResponse> {
    return this.http.put<ComparisonActionResponse>(
      `${this.apiUrl}/rows/${rowId}`,
      data
    );
  }

  deleteComparisonRow(
    rowId: number
  ): Observable<ComparisonActionResponse> {
    return this.http.delete<ComparisonActionResponse>(
      `${this.apiUrl}/rows/${rowId}`
    );
  }

  // ==================== PUBLISH / UNPUBLISH ====================

  publishComparison(
    comparisonId: number
  ): Observable<ComparisonActionResponse> {
    return this.http.patch<ComparisonActionResponse>(
      `${this.apiUrl}/${comparisonId}/publish`,
      {}
    );
  }

  unpublishComparison(
    comparisonId: number
  ): Observable<ComparisonActionResponse> {
    return this.http.patch<ComparisonActionResponse>(
      `${this.apiUrl}/${comparisonId}/unpublish`,
      {}
    );
  }
}