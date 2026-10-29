
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CodeToLogicTask {
  id: number;
  mentor_id: number;
  subject_id: number;
  subject_name: string;
  mentor_name: string;
  title: string;
  description: string;
  code_content: string;
  created_at: string;
}

export interface CodeToLogicSubmission {
  id: number;
  task_id: number;
  task_title: string;
  subject_name: string;
  explanation: string;
  submission_number: number;
  review_status: 'pending' | 'reviewed';
  submitted_at: string;
  reviewed_at: string | null;
  mentor_feedback: string | null;
  star_rating: number | null;
}


export interface CodeToLogicSubmissionStatus {
  latestSubmission: {
    id: number;
    submission_number: number;
    review_status: 'pending' | 'reviewed';
    submitted_at: string;
    reviewed_at: string | null;
    mentor_feedback: string | null;
    star_rating: number | null;
  } | null;

  canSubmit: boolean;
  attemptCount: number;
}


@Injectable({
  providedIn: 'root'
})
export class StudentCodeToLogicService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:5000/api/student/advanced/code-logic';

  // GET AVAILABLE PUBLISHED TASKS
  getAvailableTasks(): Observable<{ tasks: CodeToLogicTask[] }> {
    return this.http.get<{ tasks: CodeToLogicTask[] }>(
      `${this.apiUrl}/tasks`
    );
  }

  // GET ONE TASK'S DETAILS
getTaskDetails(
  taskId: number
): Observable<{ task: CodeToLogicTask }> {
  return this.http.get<{ task: CodeToLogicTask }>(
    `${this.apiUrl}/tasks/${taskId}`
  );
}

  // GET ONE TASK FROM THE AVAILABLE TASK LIST
  // The backend currently provides the task-list endpoint only.
  // We will add a dedicated details endpoint when building that page.

  // SUBMIT AN EXPLANATION
  submitExplanation(
    taskId: number,
    explanation: string
  ): Observable<{
    message: string;
    submissionNumber: number;
  }> {
    return this.http.post<{
      message: string;
      submissionNumber: number;
    }>(
      `${this.apiUrl}/tasks/${taskId}/submit`,
      { explanation }
    );
  }

  // GET MY SUBMISSION HISTORY AND MENTOR FEEDBACK
  getMySubmissions(): Observable<{
    submissions: CodeToLogicSubmission[];
  }> {
    return this.http.get<{
      submissions: CodeToLogicSubmission[];
    }>(`${this.apiUrl}/submissions`);
  }

getTaskSubmissionStatus(taskId: number) {
  return this.http.get<CodeToLogicSubmissionStatus>(
    `${this.apiUrl}/tasks/${taskId}/submission-status`
  );
}

}
