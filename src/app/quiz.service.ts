import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class QuizService {
    constructor(private http: HttpClient) {}

    getQuestions(): Observable<any> {
        return this.http.get('/api/questions');
    }

    uploadQuestions(questions: any[]) {
        return this.http.post('http://localhost:3000/api/upload-questions', { questions });
      }

      fetchQuestions() {
        return this.http.get<{ questions: any[] }>('http://localhost:3000/api/get-questions');
      }
      
      
}
