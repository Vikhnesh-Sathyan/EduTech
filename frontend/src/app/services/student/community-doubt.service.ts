
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CommunityDoubt {
  id: number;
  student_id: number;
  subject_id: number;
  title: string;
  question: string;
  student_name?: string;
  subject_name?: string;
  reply_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityDoubtReply {
  id: number;
  doubt_id: number;
  student_id: number;
  reply: string;
  student_name?: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommunityDoubtService {
  private http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:5000/api/recommendation/doubts';

  getAllDoubts(): Observable<{ doubts: CommunityDoubt[] }> {
    return this.http.get<{ doubts: CommunityDoubt[] }>(
      this.apiUrl
    );
  }

  getMyDoubts(): Observable<{ doubts: CommunityDoubt[] }> {
    return this.http.get<{ doubts: CommunityDoubt[] }>(
      `${this.apiUrl}/my`
    );
  }

  getDoubtById(
    id: number
  ): Observable<{
    doubt: CommunityDoubt;
    replies: CommunityDoubtReply[];
  }> {
    return this.http.get<{
      doubt: CommunityDoubt;
      replies: CommunityDoubtReply[];
    }>(`${this.apiUrl}/${id}`);
  }

  createDoubt(data: {
    subject_id: number;
    title: string;
    question: string;
  }): Observable<{ message: string; doubtId: number }> {
    return this.http.post<{ message: string; doubtId: number }>(
      this.apiUrl,
      data
    );
  }

  updateDoubt(
    id: number,
    data: {
      subject_id: number;
      title: string;
      question: string;
    }
  ): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/${id}`,
      data
    );
  }

  deleteDoubt(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${id}`
    );
  }

  createReply(
    doubtId: number,
    reply: string
  ): Observable<{ message: string; replyId: number }> {
    return this.http.post<{ message: string; replyId: number }>(
      `${this.apiUrl}/${doubtId}/replies`,
      { reply }
    );
  }

  updateReply(
    replyId: number,
    reply: string
  ): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/replies/${replyId}`,
      { reply }
    );
  }

  deleteReply(replyId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/replies/${replyId}`
    );
  }
}
