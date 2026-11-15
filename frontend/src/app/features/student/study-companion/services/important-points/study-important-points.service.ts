
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  GenerateImportantPointsResponse,
  StudyImportantPointsResponse
} from '../../models/important-points/study-important-points.model';

@Injectable({
  providedIn: 'root'
})
export class StudyImportantPointsService {

  private apiUrl = 'http://localhost:5000/api/student/study-companion';

  constructor(private http: HttpClient) {}

  // Generate and save important points
  generateImportantPoints(
    sessionUuid: string
  ): Observable<GenerateImportantPointsResponse> {

    return this.http.post<GenerateImportantPointsResponse>(
      `${this.apiUrl}/${sessionUuid}/important-points`,
      {}
    );
  }

  // Retrieve saved important points
  getImportantPoints(
    sessionUuid: string
  ): Observable<StudyImportantPointsResponse> {

    return this.http.get<StudyImportantPointsResponse>(
      `${this.apiUrl}/${sessionUuid}/important-points`
    );
  }

}
