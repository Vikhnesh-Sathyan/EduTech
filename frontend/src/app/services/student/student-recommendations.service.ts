import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StudentRecommendationsService {

  private apiUrl = 'http://localhost:5000/api/student/recommendations';

  constructor(private http: HttpClient) {}

  // ==========================================
  // RESOURCES
  // ==========================================

  getApprovedResources(subjectId: string | number) {
    return this.http.get<any[]>(
      `${this.apiUrl}/resources`,
      {
        params: { subjectId: String(subjectId) }
      }
    );
  }

  getMyResources() {
    return this.http.get<any[]>(
      `${this.apiUrl}/resources/my`
    );
  }

  createResource(data: {
    subject_id: number;
    title: string;
    description?: string;
    resource_type: string;
    resource_url?: string;
    resource_content?: string;
  }) {
    return this.http.post(
      `${this.apiUrl}/resources`,
      data
    );
  }

  // ==========================================
  // COMMUNITY DOUBTS
  // ==========================================

  getApprovedDoubts(subjectId: string | number) {
    return this.http.get<any[]>(
      `${this.apiUrl}/doubts`,
      {
        params: { subjectId: String(subjectId) }
      }
    );
  }

  getMyDoubts() {
    return this.http.get<any[]>(
      `${this.apiUrl}/doubts/my`
    );
  }

  createDoubt(data: {
    subject_id: number;
    title: string;
    question: string;
  }) {
    return this.http.post(
      `${this.apiUrl}/doubts`,
      data
    );
  }

  getDoubtReplies(doubtId: number) {
    return this.http.get<any[]>(
      `${this.apiUrl}/doubts/${doubtId}/replies`
    );
  }

  createReply(doubtId: number, reply: string) {
    return this.http.post(
      `${this.apiUrl}/doubts/${doubtId}/replies`,
      { reply }
    );
  }

  // ==========================================
  // INTERVIEW PREPARATION
  // ==========================================

  getApprovedInterviewPrep(
    subjectId?: string | number,
    prepType?: string,
    difficulty?: string
  ) {
    const params: Record<string, string> = {};

    if (subjectId !== undefined && subjectId !== null) {
      params['subjectId'] = String(subjectId);
    }

    if (prepType) {
      params['prepType'] = prepType;
    }

    if (difficulty) {
      params['difficulty'] = difficulty;
    }

    return this.http.get<any[]>(
      `${this.apiUrl}/interview-prep`,
      { params }
    );
  }

  getMyInterviewPrep() {
    return this.http.get<any[]>(
      `${this.apiUrl}/interview-prep/my`
    );
  }

  createInterviewPrep(data: {
    subject_id?: number | null;
    title: string;
    description?: string;
    prep_type: string;
    content: string;
    difficulty?: string | null;
  }) {
    return this.http.post(
      `${this.apiUrl}/interview-prep`,
      data
    );
  }

}
