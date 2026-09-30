import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StudentLearning {

  private apiUrl =
    'http://localhost:5000/api/study';

  constructor(
    private http: HttpClient
  ) {}

  // Get complete learning hierarchy for one subject
  getLearningStructure(subjectId: number) {

    return this.http.get(
      `${this.apiUrl}/subjects/${subjectId}/learning`
    );

  }

}