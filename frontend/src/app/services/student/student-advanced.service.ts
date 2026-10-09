
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StudentAdvancedService {

  private apiUrl = 'http://localhost:5000/api/student/advanced';

  constructor(private http: HttpClient) {}

  getAdvancedLearning(subtopicId: number) {
    return this.http.get(
      `${this.apiUrl}/${subtopicId}`
    );
  }
}
