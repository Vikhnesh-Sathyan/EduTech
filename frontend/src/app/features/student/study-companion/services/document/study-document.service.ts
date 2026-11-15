
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  StudyDocumentUploadResponse,
  StudyDocumentListResponse
} from '../../models/document/study-document.model';

@Injectable({
  providedIn: 'root'
})
export class StudyDocumentService {

  private apiUrl =
    'http://localhost:5000/api/student/study-companion';

  constructor(private http: HttpClient) {}

  // ==========================================
  // UPLOAD PDF DOCUMENT
  // ==========================================

  uploadPdf(file: File): Observable<StudyDocumentUploadResponse> {

    const formData = new FormData();

    formData.append('file', file);

    return this.http.post<StudyDocumentUploadResponse>(
      `${this.apiUrl}/upload`,
      formData
    );
  }

  // ==========================================
  // UPLOAD TEXT NOTES
  // ==========================================

  uploadText(text: string): Observable<StudyDocumentUploadResponse> {

    return this.http.post<StudyDocumentUploadResponse>(
      `${this.apiUrl}/upload-text`,
      { text }
    );
  }

  // ==========================================
  // GET STUDENT DOCUMENTS
  // ==========================================

  getStudentDocuments(): Observable<StudyDocumentListResponse> {

    return this.http.get<StudyDocumentListResponse>(
      `${this.apiUrl}/documents`
    );
  }

}
