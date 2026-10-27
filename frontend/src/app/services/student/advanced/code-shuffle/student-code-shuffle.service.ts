import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StudentCodeShuffleTask {
  id: number;
  title: string;
  description: string | null;
  difficulty: string;
  max_marks: number;
  hint_text: string | null;
  publish_date: string | null;
  due_date: string | null;
  language_id?: number;
  language_name: string;
  topics?: string | null;
  total_blocks?: number;
  progress_status?: string | null;
  first_score?: number | null;
  latest_score?: number | null;
  best_score?: number | null;
  attempt_count?: number;
}

export interface StudentCodeShuffleBlock {
  id: number;
  block_content: string;
}

export interface StudentCodeShuffleTaskDetails {
  id: number;
  title: string;
  description: string | null;
  difficulty: string;
  max_marks: number;
  hint_text: string | null;
  publish_date: string | null;
  due_date: string | null;
  language_name: string;
}

export interface StudentCodeShuffleAttempt {
  id: number;
  score: number;
  max_marks: number;
  hints_used: number;
  time_taken_seconds: number;
  is_correct: number;
  submitted_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentCodeShuffleService {
  private readonly apiUrl =
    'http://localhost:5000/api/student/advanced/code-shuffle';

  constructor(private http: HttpClient) {}

  getPublishedTasks(): Observable<{
    message: string;
    tasks: StudentCodeShuffleTask[];
  }> {
    return this.http.get<{
      message: string;
      tasks: StudentCodeShuffleTask[];
    }>(`${this.apiUrl}/tasks`);
  }

  getPublishedTaskById(taskId: number): Observable<{
    message: string;
    task: StudentCodeShuffleTaskDetails;
    blocks: StudentCodeShuffleBlock[];
  }> {
    return this.http.get<{
      message: string;
      task: StudentCodeShuffleTaskDetails;
      blocks: StudentCodeShuffleBlock[];
    }>(`${this.apiUrl}/tasks/${taskId}`);
  }

  submitAttempt(
    taskId: number,
    payload: {
      submittedOrder: number[];
      hintsUsed: number;
      timeTakenSeconds: number;
    }
  ): Observable<{
    message: string;
    score: number;
    maxMarks: number;
    correctPositions: number;
    totalCorrectBlocks: number;
    isCorrect: boolean;
    progressStatus: string;
  }> {
    return this.http.post<{
      message: string;
      score: number;
      maxMarks: number;
      correctPositions: number;
      totalCorrectBlocks: number;
      isCorrect: boolean;
      progressStatus: string;
    }>(`${this.apiUrl}/tasks/${taskId}/submit`, payload);
  }

  getMyTaskAttempts(taskId: number): Observable<{
    message: string;
    progress: {
      status: string;
      first_score: number | null;
      latest_score: number | null;
      best_score: number | null;
      attempt_count: number;
      completed_at: string | null;
    } | null;
    attempts: StudentCodeShuffleAttempt[];
  }> {
    return this.http.get<{
      message: string;
      progress: {
        status: string;
        first_score: number | null;
        latest_score: number | null;
        best_score: number | null;
        attempt_count: number;
        completed_at: string | null;
      } | null;
      attempts: StudentCodeShuffleAttempt[];
    }>(`${this.apiUrl}/tasks/${taskId}/attempts`);
  }
}