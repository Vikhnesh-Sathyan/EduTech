
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CheatSheetCategory {
  id: number;
  technology_id: number;
  name: string;
  display_order: number;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

interface CategoriesResponse {
  message: string;
  categories: CheatSheetCategory[];
}

interface CategoryResponse {
  message: string;
  category?: CheatSheetCategory;
}

@Injectable({
  providedIn: 'root'
})
export class CheatsheetCategoryService {
  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:5000/api/admin/cheatsheet/categories';

  getCategories(technologyId: number): Observable<CategoriesResponse> {
    return this.http.get<CategoriesResponse>(
      `${this.apiUrl}/technology/${technologyId}`
    );
  }

  addCategory(
    technologyId: number,
    data: { name: string; display_order: number }
  ): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>(
      `${this.apiUrl}/technology/${technologyId}`,
      data
    );
  }

  updateCategory(
    id: number,
    data: { name: string; display_order: number }
  ): Observable<CategoryResponse> {
    return this.http.put<CategoryResponse>(
      `${this.apiUrl}/${id}`,
      data
    );
  }

  deleteCategory(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${id}`
    );
  }
}
