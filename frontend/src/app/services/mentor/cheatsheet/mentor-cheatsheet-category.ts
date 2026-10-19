
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MentorCheatsheetCategory {
  id: number;
  technology_id: number;
  name: string;
  display_order: number;
  created_by: number;
}

interface CategoriesResponse {
  message: string;
  categories: MentorCheatsheetCategory[];
}

interface CategoryResponse {
  message: string;
  categoryId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MentorCheatsheetCategoryService {

  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:5000/api/mentor/cheatsheet/categories';

  getCategories(
    technologyId: number
  ): Observable<CategoriesResponse> {
    return this.http.get<CategoriesResponse>(
      `${this.apiUrl}/technology/${technologyId}`
    );
  }

  createCategory(
    technologyId: number,
    data: { name: string; display_order: number }
  ): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>(
      `${this.apiUrl}/technology/${technologyId}`,
      data
    );
  }

  updateCategory(
    categoryId: number,
    data: { name: string; display_order: number }
  ): Observable<CategoryResponse> {
    return this.http.put<CategoryResponse>(
      `${this.apiUrl}/${categoryId}`,
      data
    );
  }

  deleteCategory(
    categoryId: number
  ): Observable<CategoryResponse> {
    return this.http.delete<CategoryResponse>(
      `${this.apiUrl}/${categoryId}`
    );
  }
}
