
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentCareerQuestionsService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5000/api/student/career-hub';

  getQuestionFormData(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/career-questions/form-data`
    );
  }

  submitCareerQuestion(data: {
    category_id: number;
    question_text: string;
    answer_text?: string;
    explanation?: string;
  }): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/career-questions`,
      data
    );
  }

  getCareerQuestions(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/career-questions`
    );
  }
}
