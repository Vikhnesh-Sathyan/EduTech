import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class TemplateService {
  constructor(private http: HttpClient) {}

  // Fetch templates
  getTemplates(): Observable<any[]> {
    return this.http.get<any[]>('/api/templates');
  }

  // Fetch preview for a template
  getPreview(data: any): Observable<{ html: string }> {
    return this.http.post<{ html: string }>('/api/templates/preview', data);
  }

  // Generate final resume
  generateResume(userId: number, data: any): Observable<Blob> {
    return this.http.post('/api/resumes/' + userId, data, { responseType: 'blob' });
  }
}
