
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Resource data returned by our Node.js backend
export interface Resource {
  id: number;
  student_id: number;
  subject_id: number;
  title: string;
  description?: string | null;
  resource_type: 'notes' | 'pdf' | 'video' | 'image' | 'study_tips';
  resource_url?: string | null;
  resource_content?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string | null;
  created_at?: string;
  updated_at?: string;
  reviewed_at?: string | null;
  contributor_name?: string;
  subject_name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResourceService {

  private readonly apiUrl =
    'http://localhost:5000/api/recommendation/resources';

  constructor(private readonly http: HttpClient) {}

  // Get resources approved by the admin
  getApprovedResources(
    subjectId?: number,
    resourceType?: string
  ): Observable<any> {

    let params = new HttpParams();

    if (subjectId) {
      params = params.set('subject_id', subjectId);
    }

    if (resourceType) {
      params = params.set('resource_type', resourceType);
    }

    return this.http.get<any>(
      `${this.apiUrl}/approved`,
      { params }
    );
  }

  // Get the logged-in student's submissions
  getMyResources(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/my`);
  }

  // Submit a new resource
  submitResource(formData: FormData): Observable<any> {
    return this.http.post<any>(
      this.apiUrl,
      formData
    );
  }

  // Edit an existing resource
  updateResource(
    id: number,
    formData: FormData
  ): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${id}`,
      formData
    );
  }

  // Delete a student's own resource
  deleteResource(id: number): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/${id}`
    );
  }

  
  // ADMIN: Get resources waiting for approval
  getPendingResources(): Observable<{ resources: Resource[] }> {
    return this.http.get<{ resources: Resource[] }>(
      `${this.apiUrl}/pending`
    );
  }

  // ADMIN: Approve a pending resource
  approveResource(id: number): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/${id}/approve`,
      {}
    );
  }

  // ADMIN: Reject a pending resource
  rejectResource(
    id: number,
    rejectionReason: string
  ): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/${id}/reject`,
      { rejection_reason: rejectionReason }
    );
  }

}
