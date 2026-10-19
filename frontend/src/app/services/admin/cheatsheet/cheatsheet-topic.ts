
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CheatSheetTopic {
  id: number;
  category_id: number;
  name: string;
  definition: string;
  code_example: string | null;
  memory_trick: string | null;
  expected_output: string | null;
  display_order: number;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

interface TopicsResponse {
  message: string;
  topics: CheatSheetTopic[];
}

interface TopicResponse {
  message: string;
  topic?: CheatSheetTopic;
}

export interface CheatSheetTopicForm {
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
export class CheatsheetTopicService {
  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:5000/api/admin/cheatsheet/topics';

  getTopics(categoryId: number): Observable<TopicsResponse> {
    return this.http.get<TopicsResponse>(
      `${this.apiUrl}/category/${categoryId}`
    );
  }

  addTopic(
    categoryId: number,
    data: CheatSheetTopicForm
  ): Observable<TopicResponse> {
    return this.http.post<TopicResponse>(
      `${this.apiUrl}/category/${categoryId}`,
      data
    );
  }

  updateTopic(
    id: number,
    data: CheatSheetTopicForm
  ): Observable<TopicResponse> {
    return this.http.put<TopicResponse>(
      `${this.apiUrl}/${id}`,
      data
    );
  }

  deleteTopic(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${id}`
    );
  }
}
