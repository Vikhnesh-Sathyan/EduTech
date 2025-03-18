import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProblemService {
  private apiUrl = 'http://localhost:3000/api/problems';

  constructor(private http: HttpClient) {}

  getProblems(company: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?company=${company}`);
  }

  addProblem(problem: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, problem);
  }
}
