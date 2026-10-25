
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
}
