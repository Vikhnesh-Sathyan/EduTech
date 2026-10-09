import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminTopicLearning {

  private apiUrl =
    'http://localhost:5000/api/admin/topic-learning';

  constructor(
    private http: HttpClient
  ) {}

  // Get learning content for a topic
  getTopicLearningContent(topicId: number) {
    return this.http.get(
      `${this.apiUrl}/${topicId}`
    );
  }

  // Create learning content
  createTopicLearningContent(data: FormData) {
    return this.http.post(
      this.apiUrl,
      data
    );
  }

  // Update learning content
  updateTopicLearningContent(
    topicId: number,
    data: FormData
  ) {
    return this.http.put(
      `${this.apiUrl}/${topicId}`,
      data
    );
  }
}