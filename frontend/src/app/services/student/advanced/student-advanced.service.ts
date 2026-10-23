
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StudentAdvancedModule {
  id: number;
  moduleType: string;
  displayOrder: number;
  content: Record<string, any> | null;
}

export interface StudentAdvancedSection {
  advancedId: number;
  sectionId: number;
  subtopicId: number;
  sectionTitle: string;
  subtopicTitle: string;
  advancedUnlocked: boolean;
}

export interface StudentAdvancedResponse {
  advancedUnlocked: boolean;
  sectionId: number;
  sectionTitle: string;
  subtopicId: number;
  subtopicTitle: string;
  advancedId: number;
  modules: StudentAdvancedModule[];
}

export interface StudentAdvancedSubjectSection {
  advancedId: number;
  sectionId: number;
  subtopicId: number;
  sectionTitle: string;
  subtopicTitle: string;
  advancedUnlocked: boolean;
}

export interface StudentAdvancedSubjectGroup {
  subjectId: number;
  subjectName: string;
  sections: StudentAdvancedSubjectSection[];
}

@Injectable({
  providedIn: 'root'
})
export class StudentAdvancedService {

  private readonly apiUrl =
    'http://localhost:5000/api/student/advanced';

  constructor(private http: HttpClient) {}

  getAdvancedLearning(
    sectionId: number
  ): Observable<StudentAdvancedResponse> {
    return this.http.get<StudentAdvancedResponse>(
      `${this.apiUrl}/section/${sectionId}`
    );
  }

  getAdvancedSections(): Observable<{
    sections: StudentAdvancedSection[];
  }> {
    return this.http.get<{
      sections: StudentAdvancedSection[];
    }>(`${this.apiUrl}/sections`);
  }

  getAdvancedSubjects(): Observable<{
    subjects: StudentAdvancedSubjectGroup[];
  }> {
    return this.http.get<{
      subjects: StudentAdvancedSubjectGroup[];
    }>(`${this.apiUrl}/subjects`);
  }
}
