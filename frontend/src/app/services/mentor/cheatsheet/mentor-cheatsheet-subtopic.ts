
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MentorCheatsheetSubtopic {
  id: number;
  topic_id: number;
  name: string;
  definition: string;
  code_example: string | null;
  memory_trick: string | null;
  expected_output: string | null;
  display_order: number;
  created_by: number;
}

interface SubtopicsResponse {
  message: string;
  subtopics: MentorCheatsheetSubtopic[];
}

interface SubtopicResponse {
  message: string;
  subtopicId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MentorCheatsheetSubtopicService {
  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:5000/api/mentor/cheatsheet/subtopics';

  getSubtopics(topicId: number): Observable<SubtopicsResponse> {
    return this.http.get<SubtopicsResponse>(
      `${this.apiUrl}/topic/${topicId}`
    );
  }

  createSubtopic(
    topicId: number,
    data: {
      name: string;
      definition: string;
      code_example?: string | null;
      memory_trick?: string | null;
      expected_output?: string | null;
      display_order: number;
    }
  ): Observable<SubtopicResponse> {
    return this.http.post<SubtopicResponse>(
      `${this.apiUrl}/topic/${topicId}`,
      data
    );
  }

  updateSubtopic(
    subtopicId: number,
    data: {
      name: string;
      definition: string;
      code_example?: string | null;
      memory_trick?: string | null;
      expected_output?: string | null;
      display_order: number;
    }
  ): Observable<SubtopicResponse> {
    return this.http.put<SubtopicResponse>(
      `${this.apiUrl}/${subtopicId}`,
      data
    );
  }

  deleteSubtopic(subtopicId: number): Observable<SubtopicResponse> {
    return this.http.delete<SubtopicResponse>(
      `${this.apiUrl}/${subtopicId}`
    );
  }
}
