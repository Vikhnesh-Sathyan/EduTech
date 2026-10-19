
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CheatSheetTechnology {
  id: number;
  name: string;
  sort_name: string;
  description: string | null;
  status: 'active' | 'inactive';
}

export interface TechnologiesResponse {
  message: string;
  technologies: CheatSheetTechnology[];
}

interface TechnologyResponse {
  message: string;
  technology?: CheatSheetTechnology;
}

@Injectable({
  providedIn: 'root'
})
export class CheatsheetTechnologyService {
  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:5000/api/admin/cheatsheet/technologies';

  getTechnologies(): Observable<TechnologiesResponse> {
    return this.http.get<TechnologiesResponse>(this.apiUrl);
  }

  addTechnology(data: {
    name: string;
    description?: string;
    status: 'active' | 'inactive';
  }): Observable<TechnologyResponse> {
    return this.http.post<TechnologyResponse>(this.apiUrl, data);
  }

  updateTechnology(
    id: number,
    data: {
      name: string;
      description?: string;
      status: 'active' | 'inactive';
    }
  ): Observable<TechnologyResponse> {
    return this.http.put<TechnologyResponse>(
      `${this.apiUrl}/${id}`,
      data
    );
  }

  deleteTechnology(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${id}`
    );
  }
}
