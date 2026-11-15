
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  StudyDocumentPagesResponse
} from '../../models/document/study-document-pages.model';

@Injectable({
  providedIn: 'root'
})
export class StudyDocumentViewerService {

  private apiUrl =
    'http://localhost:5000/api/student/study-companion';

  constructor(private http: HttpClient) {}

  getDocumentPages(
    sessionUuid: string
  ): Observable<StudyDocumentPagesResponse> {

    return this.http.get<StudyDocumentPagesResponse>(
      `${this.apiUrl}/${sessionUuid}/pages`
    );

  }

}
