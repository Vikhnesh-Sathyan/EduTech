
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StudentTheoryQuiz {
  id: number;
  title: string;
  description?: string | null;
  status: string;
  difficulty?: string | null;
  pass_percentage?: number | null;
  updated_at?: string | null;
  program_name: string | null;
  department_name: string | null;
  education_year_name: string | null;
  subject_name: string | null;
}

export interface StudentTheoryQuizzesResponse {
  quizzes: StudentTheoryQuiz[];
}

@Injectable({
  providedIn: 'root'
})
export class StudentTheoryQuizService {

  private readonly apiUrl =
    'http://localhost:5000/api/student/advanced/theory-quizzes';

  constructor(private http: HttpClient) {}

  getPublishedQuizzes(): Observable<StudentTheoryQuizzesResponse> {
    return this.http.get<StudentTheoryQuizzesResponse>(this.apiUrl);
  }

  getQuizById(quizId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${quizId}`);
  }

  
  startOrResumeAttempt(quizId: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${quizId}/attempt`,
      {}
    );
  }

submitAttempt(
  quizId: number,
  attemptId: number,
  answers: {
    question_id: number;
    selected_option_id: number | null;
    hint_used?: boolean;
  }[],
  autoSubmit = false
): Observable<any> {
  return this.http.post<any>(
    `${this.apiUrl}/${quizId}/attempt/${attemptId}/submit`,
    {
      answers,
      auto_submit: autoSubmit
    }
  );
}
  saveAttemptProgress(
  quizId: number,
  attemptId: number,
  currentQuestionIndex: number,
  answers: {
    question_id: number;
    selected_option_id: number | null;
    marked_for_review: boolean;
    hint_used?: boolean;
  }[]
): Observable<any> {
  return this.http.post<any>(
    `${this.apiUrl}/${quizId}/attempt/${attemptId}/progress`,
    {
      current_question_index: currentQuestionIndex,
      answers
    }
  );
}

}
