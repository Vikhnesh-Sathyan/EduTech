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
  resource_type: 'notes' | 'pdf' | 'code' | 'exam_tips' | 'video' | 'image';
  resource_url?: string;
  resource_content?: string;
  code_language?: string;
  code_annotations?: {
    line: number;
    type: 'important' | 'explanation' | 'mistake' | 'output';
    note?: string;
  }[];
  file?: File;
}) {
  // Use multipart/form-data when submitting an uploaded file.
  if (data.file) {
    const formData = new FormData();

    formData.append('subject_id', String(data.subject_id));
    formData.append('title', data.title);
    formData.append('resource_type', data.resource_type);
    formData.append('file', data.file, data.file.name);

    if (data.description) {
      formData.append('description', data.description);
    }

    if (data.resource_url) {
      formData.append('resource_url', data.resource_url);
    }

    if (data.resource_content) {
      formData.append('resource_content', data.resource_content);
    }

    return this.http.post(
      `${this.apiUrl}/resources`,
      formData
    );
  }

  // Keep normal JSON submissions for text-based resources.
  const { file, ...resourceData } = data;

  return this.http.post(
    `${this.apiUrl}/resources`,
    resourceData
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
