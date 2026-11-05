
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TheoryChallengeType {
  id: number;
  type_key: string;
  name: string;
  description: string | null;
  content_schema: any;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

interface TheoryChallengeTypesResponse {
  success: boolean;
  challengeTypes: TheoryChallengeType[];
}

interface TheoryChallengeTypeResponse {
  success: boolean;
  message: string;
  challengeTypeId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TheoryChallengeTypeService {

  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:5000/api/admin/theory-challenge-types';

  getTheoryChallengeTypes(): Observable<TheoryChallengeTypesResponse> {
    return this.http.get<TheoryChallengeTypesResponse>(this.apiUrl);
  }

  createTheoryChallengeType(data: any): Observable<TheoryChallengeTypeResponse> {
    return this.http.post<TheoryChallengeTypeResponse>(this.apiUrl, data);
  }

  updateTheoryChallengeType(
    typeId: number,
    data: any
  ): Observable<TheoryChallengeTypeResponse> {
    return this.http.put<TheoryChallengeTypeResponse>(
      `${this.apiUrl}/${typeId}`,
      data
    );
  }
}
