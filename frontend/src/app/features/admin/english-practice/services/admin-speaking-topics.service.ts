import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  AdminSpeakingTopic,
  AdminSpeakingTopicsResponse,
  AdminSpeakingTopicResponse
} from '../models/speaking-topic.model';

@Injectable({
  providedIn: 'root'
})
export class AdminSpeakingTopicsService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:5000/api/english-practice/admin/topics';

  // Get all speaking topics
  getTopics(): Observable<AdminSpeakingTopicsResponse> {
    return this.http.get<AdminSpeakingTopicsResponse>(
      this.apiUrl
    );
  }

  // Get one topic
  getTopicById(
    topicId: number
  ): Observable<AdminSpeakingTopicResponse> {
    return this.http.get<AdminSpeakingTopicResponse>(
      `${this.apiUrl}/${topicId}`
    );
  }

  // Create topic
  createTopic(
    topic: Partial<AdminSpeakingTopic>
  ): Observable<AdminSpeakingTopicResponse> {
    return this.http.post<AdminSpeakingTopicResponse>(
      this.apiUrl,
      topic
    );
  }

  // Update topic
  updateTopic(
    topicId: number,
    topic: Partial<AdminSpeakingTopic>
  ): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.apiUrl}/${topicId}`,
      topic
    );
  }

  // Activate or deactivate topic
  updateTopicStatus(
    topicId: number,
    status: 'active' | 'inactive'
  ): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(
      `${this.apiUrl}/${topicId}/status`,
      { status }
    );
  }

  // Delete topic
  deleteTopic(
    topicId: number
  ): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/${topicId}`
    );
  }
}