
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CareerResource {
  id: number;
  resource_type: string;
  title: string;
  country_id: number | null;
  country_name: string | null;
  experience_level: string;
  description: string;
  created_by: number;
  contributor_name: string;
  status: string;
  publication_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  file_count: number;
  public_copy_name: string | null;
  public_copy_size: number | null;
}

interface ResourceResponse {
  message: string;
  resources?: CareerResource[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminCareerResources {

  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:5000/api/admin/career-hub/resources';

  getResources(): Observable<ResourceResponse> {
    return this.http.get<ResourceResponse>(this.apiUrl);
  }

  previewResource(id: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/${id}/preview`,
      { responseType: 'blob' }
    );
  }

  archiveResource(id: number): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${id}/archive`,
      {}
    );
  }
}
