
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MentorCheatsheetTopic {
  id: number;
  category_id: number;
  name: string;
  definition: string;
  code_example: string | null;
  memory_trick: string | null;
  expected_output: string | null;
  display_order: number;
  created_by: number;
}

interface TopicsResponse {
  message: string;
  topics: MentorCheatsheetTopic[];
}

interface TopicResponse {
  message: string;
  topicId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MentorCheatsheetTopicService {
  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:5000/api/mentor/cheatsheet/topics';

  getTopics(categoryId: number): Observable<TopicsResponse> {
    return this.http.get<TopicsResponse>(
      `${this.apiUrl}/category/${categoryId}`
    );
  }

  createTopic(
    categoryId: number,
    data: {
      name: string;
      definition: string;
      code_example?: string | null;
      memory_trick?: string | null;
      expected_output?: string | null;
      display_order: number;
    }
  ): Observable<TopicResponse> {
    return this.http.post<TopicResponse>(
      `${this.apiUrl}/category/${categoryId}`,
      data
    );
  }

  updateTopic(
    topicId: number,
    data: {
      name: string;
      definition: string;
      code_example?: string | null;
      memory_trick?: string | null;
      expected_output?: string | null;
      display_order: number;
    }
  ): Observable<TopicResponse> {
    return this.http.put<TopicResponse>(
      `${this.apiUrl}/${topicId}`,
      data
    );
  }

  deleteTopic(topicId: number): Observable<TopicResponse> {
    return this.http.delete<TopicResponse>(
      `${this.apiUrl}/${topicId}`
    );
  }
}
