import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs'; // Add throwError here
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private apiUrl = 'http://localhost:3000/api'; // Update with your actual API URL

  constructor(private http: HttpClient) {}

  // Submit questions to the API
  submitQuestions(questions: any[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/questions`, questions).pipe(
      catchError((error) => {
        console.error('Error submitting questions:', error);
        return throwError(error); // Make sure throwError is recognized
      })
    );
  }

  // Fetch questions by difficulty level
  getQuestions(level: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/questions`, { params: { level } }).pipe(
      catchError((error) => {
        console.error('Error fetching questions:', error);
        return throwError(error);
      })
    );
  }
}
