import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResumeService {
  private apiUrl = 'http://localhost:3000/api/resume';

  constructor(private http: HttpClient) {}

  saveResume(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getResume(studentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${studentId}`);
  }
  getAISuggestions(section: string, input: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/ai-suggestions`, { section, input });
  }
  

}
