import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ComparisonCell {
  id: number;
  conceptId: number;
  conceptName: string | null;
  contentText: string | null;
  imageUrl: string | null;
}

export interface ComparisonRow {
  id: number;
  pointTitle: string;
  displayOrder: number;
  cells: ComparisonCell[];
}

export interface ComparisonConcept {
  id: number;
  name: string;
  displayOrder: number;
}

export interface ConceptComparison {
  id: number;
  title: string;
  description: string | null;
  status: string;
  subjectId: number;
  subjectName: string;
  educationYearId: number;
  createdAt: string;
  updatedAt: string;
  concepts: ComparisonConcept[];
  rows: ComparisonRow[];
}

@Injectable({
  providedIn: 'root'
})
export class StudentConceptComparisonService {
  private readonly apiUrl =
    'http://localhost:5000/api/student/advanced/concept-comparisons';

  constructor(private http: HttpClient) {}

  getAvailableComparisons(): Observable<ConceptComparison[]> {
    return this.http.get<ConceptComparison[]>(this.apiUrl);
  }
}