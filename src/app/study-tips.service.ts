// study-tips.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudyTipsService {
  private apiUrl = 'http://localhost:3000/tips';

  constructor(private http: HttpClient) {}

  getTipsByClass(classId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${classId}`);
  }

  addTip(tipData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, tipData);
  }

  deleteTip(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
