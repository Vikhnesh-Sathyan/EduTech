
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminCareerInterviewExperiencesService {

  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:5000/api/admin/career-hub/interview-experiences';

  private categoryApiUrl =
  'http://localhost:5000/api/admin/career-hub/career-question-categories';

  getInterviewExperiences(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  archiveInterviewExperience(id: number): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/${id}/archive`,
      {}
    );
  }

  // ==========================================
// QUESTION CATEGORY MANAGEMENT
// ==========================================

// Get all categories
getQuestionCategories(): Observable<any> {
  return this.http.get(this.categoryApiUrl);
}

// Create a category
createQuestionCategory(data: {
  category_name: string;
  description?: string;
}): Observable<any> {
  return this.http.post(this.categoryApiUrl, data);
}

// Update a category
updateQuestionCategory(
  categoryId: number,
  data: {
    category_name: string;
    description?: string;
  }
): Observable<any> {
  return this.http.put(
    `${this.categoryApiUrl}/${categoryId}`,
    data
  );
}

// Activate or deactivate a category
toggleQuestionCategoryStatus(categoryId: number): Observable<any> {
  return this.http.patch(
    `${this.categoryApiUrl}/${categoryId}/status`,
    {}
  );
}

}
