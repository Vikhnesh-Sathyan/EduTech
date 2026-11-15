
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  StudySummaryRequest,
  StudyPageSummaryRequest,
  StudySummaryResponse,
  StudyPageSummaryResponse,
  StudySummariesResponse
} from '../../models/summary/study-summary.model';

@Injectable({
  providedIn: 'root'
})
export class StudySummaryService {

  private apiUrl =
    'http://localhost:5000/api/student/study-companion';

  constructor(private http: HttpClient) {}

  // GENERATE FULL DOCUMENT SUMMARY
  generateSummary(
    sessionUuid: string,
    request: StudySummaryRequest
  ): Observable<StudySummaryResponse> {

    return this.http.post<StudySummaryResponse>(
      `${this.apiUrl}/${sessionUuid}/summary`,
      request
    );
  }

  // GENERATE SELECTED PAGE SUMMARY
  generatePageSummary(
    sessionUuid: string,
    request: StudyPageSummaryRequest
  ): Observable<StudyPageSummaryResponse> {

    return this.http.post<StudyPageSummaryResponse>(
      `${this.apiUrl}/${sessionUuid}/summary/pages`,
      request
    );
  }

  // GET SAVED SUMMARIES
  getSummaries(
    sessionUuid: string
  ): Observable<StudySummariesResponse> {

    return this.http.get<StudySummariesResponse>(
      `${this.apiUrl}/${sessionUuid}/summaries`
    );
  }

}
