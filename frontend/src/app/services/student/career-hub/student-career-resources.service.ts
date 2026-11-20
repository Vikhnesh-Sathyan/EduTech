import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ResourceCountry {
  id: number;
  country_name: string;
  country_code: string;
}

export interface ResourceFormDataResponse {
  success: boolean;
  countries: ResourceCountry[];
}

@Injectable({
  providedIn: 'root'
})


export class StudentCareerResourcesService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5000/api/student/career-hub';

  // ==========================================
  // GET PUBLISHED RESOURCES
  // ==========================================

  getCareerResources(filters?: {
    resource_type?: string;
    experience_level?: string;
    country_id?: number;
  }): Observable<any> {

    let params = new HttpParams();

    if (filters?.resource_type) {
      params = params.set('resource_type', filters.resource_type);
    }

    if (filters?.experience_level) {
      params = params.set('experience_level', filters.experience_level);
    }

    if (filters?.country_id) {
      params = params.set('country_id', filters.country_id);
    }

    return this.http.get<any>(
      `${this.apiUrl}/resources`,
      { params }
    );
  }

  // ==========================================
  // GET MY RESOURCES
  // ==========================================

  getMyResources(): Observable<any> {

    return this.http.get<any>(
      `${this.apiUrl}/my-resources`
    );
  }

  // ==========================================
  // UPLOAD ORIGINAL PDF
  // ==========================================

  uploadResource(data: FormData): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/resources`,
      data
    );
  }

  // ==========================================
  // GET ORIGINAL PDF
  // ==========================================

  getOriginalResource(resourceId: number): Observable<Blob> {

    return this.http.get(
      `${this.apiUrl}/resources/${resourceId}/original`,
      { responseType: 'blob' }
    );
  }

  // ==========================================
  // SAVE EDITED PDF PAGES
  // ==========================================

  saveEditedResource(
    resourceId: number,
    data: FormData
  ): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/resources/${resourceId}/edited-copy`,
      data
    );
  }

  // ==========================================
  // PREVIEW ANONYMIZED PDF
  // ==========================================

  previewAnonymizedCopy(resourceId: number): Observable<Blob> {

    return this.http.get(
      `${this.apiUrl}/resources/${resourceId}/preview`,
      { responseType: 'blob' }
    );
  }

  // ==========================================
  // CONFIRM PUBLICATION
  // ==========================================

  confirmPublication(resourceId: number): Observable<any> {

    return this.http.patch<any>(
      `${this.apiUrl}/resources/${resourceId}/confirm-publication`,
      { confirm_anonymization: true }
    );
  }

  // ==========================================
  // DOWNLOAD PUBLISHED RESOURCE
  // ==========================================

  downloadResource(resourceId: number): Observable<Blob> {

    return this.http.get(
      `${this.apiUrl}/resources/${resourceId}/download`,
      { responseType: 'blob' }
    );
  }

  // ==========================================
// GET RESOURCE FORM DATA
// ==========================================

getResourceFormData(): Observable<ResourceFormDataResponse> {

  return this.http.get<ResourceFormDataResponse>(
    `${this.apiUrl}/resources/form-data`
  );
}

}