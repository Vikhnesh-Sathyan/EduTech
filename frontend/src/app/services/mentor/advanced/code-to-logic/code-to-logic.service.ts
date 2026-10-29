
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// CODE TO LOGIC TASK MODEL
export interface CodeToLogicTask {
  id: number;
  mentor_id: number;
  subject_id: number;
  subject_name?: string;
  title: string;
  description: string;
  code_content: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

// STUDENT SUBMISSION MODEL
export interface CodeToLogicSubmission {
  id: number;
  task_id: number;
  student_id: number;
  student_name?: string;
  explanation: string;
  submission_number: number;
  mentor_feedback: string | null;
  star_rating: number | null;
  review_status: 'pending' | 'reviewed';
  submitted_at: string;
  reviewed_at: string | null;
}

export interface CodeToLogicSubmissionsResponse {
  task: {
    id: number;
    title: string;
  };
  submissions: CodeToLogicSubmission[];
}

@Injectable({
  providedIn: 'root'
})
export class CodeToLogicService {

  private readonly apiUrl =
    'http://localhost:5000/api/mentor/advanced/code-to-logic';

  constructor(private http: HttpClient) {}

  // CREATE TASK
  createTask(payload: {
    subject_id: number;
    title: string;
    description: string;
    code_content: string;
    status: 'draft' | 'published';
  }): Observable<{ message: string; taskId: number }> {
    return this.http.post<{ message: string; taskId: number }>(
      `${this.apiUrl}/tasks`,
      payload
    );
  }

  // GET MENTOR'S TASKS
  getMyTasks(): Observable<{
    message: string;
    tasks: CodeToLogicTask[];
  }> {
    return this.http.get<{
      message: string;
      tasks: CodeToLogicTask[];
    }>(`${this.apiUrl}/tasks`);
  }

  // GET SUBMISSIONS FOR A TASK
  getTaskSubmissions(
    taskId: number
  ): Observable<CodeToLogicSubmissionsResponse> {
    return this.http.get<CodeToLogicSubmissionsResponse>(
      `${this.apiUrl}/tasks/${taskId}/submissions`
    );
  }

  // REVIEW A STUDENT SUBMISSION
  reviewSubmission(
    submissionId: number,
    payload: {
      mentor_feedback: string;
      star_rating: number;
    }
  ): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.apiUrl}/submissions/${submissionId}/review`,
      payload
    );
  }

  
  // VIEW ONE TASK
  getTask(taskId: number): Observable<{ task: CodeToLogicTask }> {
    return this.http.get<{ task: CodeToLogicTask }>(
      `${this.apiUrl}/tasks/${taskId}`
    );
  }

  // UPDATE TASK DETAILS
  updateTask(
    taskId: number,
    payload: {
      subject_id: number;
      title: string;
      description: string;
      code_content: string;
    }
  ): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.apiUrl}/tasks/${taskId}`,
      payload
    );
  }

  // PUBLISH A DRAFT TASK
  publishTask(taskId: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.apiUrl}/tasks/${taskId}/publish`,
      {}
    );
  }

  // DELETE TASK
  deleteTask(taskId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/tasks/${taskId}`
    );
  }

}
