
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CheatSheetSubtopic {
  id: number;
  topic_id: number;
  name: string;
  definition: string;
  code_example: string | null;
  memory_trick: string | null;
  expected_output: string | null;
  display_order: number;
  created_by?: number;
  updated_at?: string;
}

interface SubtopicsResponse {
  message: string;
  subtopics: CheatSheetSubtopic[];
}

interface SubtopicResponse {
  message: string;
  subtopic?: CheatSheetSubtopic;
}

export interface CheatSheetSubtopicForm {
  name: string;
  definition: string;
  code_example: string;
  memory_trick: string;
  expected_output: string;
  display_order: number;
}

@Injectable({
  providedIn: 'root'
})
export class CheatsheetSubtopicService {
  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:5000/api/admin/cheatsheet/subtopics';

  getSubtopics(topicId: number): Observable<SubtopicsResponse> {
    return this.http.get<SubtopicsResponse>(
      `${this.apiUrl}/topic/${topicId}`
    );
  }

  addSubtopic(
    topicId: number,
    data: CheatSheetSubtopicForm
  ): Observable<SubtopicResponse> {
    return this.http.post<SubtopicResponse>(
      `${this.apiUrl}/topic/${topicId}`,
      data
    );
  }

  updateSubtopic(
    id: number,
    data: CheatSheetSubtopicForm
  ): Observable<SubtopicResponse> {
    return this.http.put<SubtopicResponse>(
      `${this.apiUrl}/${id}`,
      data
    );
  }

  deleteSubtopic(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${id}`
    );
  }
}
