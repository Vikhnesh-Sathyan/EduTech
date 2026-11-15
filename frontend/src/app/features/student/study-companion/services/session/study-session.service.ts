
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  StudySessionRestoreResponse
} from '../../models/session/study-session.model';

@Injectable({
  providedIn: 'root'
})
export class StudySessionService {

  private apiUrl =
    'http://localhost:5000/api/student/study-companion';

  constructor(private http: HttpClient) {}

  // ==========================================
  // RESTORE STUDY SESSION
  // ==========================================

  restoreSession(
    sessionUuid: string
  ): Observable<StudySessionRestoreResponse> {

    return this.http.post<StudySessionRestoreResponse>(
      `${this.apiUrl}/${sessionUuid}/restore`,
      {}
    );
  }

}
