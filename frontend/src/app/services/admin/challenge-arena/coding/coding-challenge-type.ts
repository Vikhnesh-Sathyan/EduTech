
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface CodingChallengeType {
  id: number;
  type_key: string;
  name: string;
  description: string | null;
  content_schema: any;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}



interface CodingChallengeTypesResponse {
  success: boolean;
  challengeTypes: CodingChallengeType[];
}

interface CodingChallengeTypeResponse {
  success: boolean;
  message: string;
  challengeTypeId?: number;
}



@Injectable({
  providedIn: 'root'
})
export class CodingChallengeTypeService {

  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:5000/api/admin/coding-challenge-types';


  getCodingChallengeTypes(): Observable<CodingChallengeTypesResponse> {
    return this.http.get<CodingChallengeTypesResponse>(
      this.apiUrl
    );
  }


  createCodingChallengeType(
    data: any
  ): Observable<CodingChallengeTypeResponse> {
    return this.http.post<CodingChallengeTypeResponse>(
      this.apiUrl,
      data
    );
  }

  updateCodingChallengeType(
  typeId: number,
  data: any
): Observable<CodingChallengeTypeResponse> {
  return this.http.put<CodingChallengeTypeResponse>(
    `${this.apiUrl}/${typeId}`,
    data
  );
}

}
