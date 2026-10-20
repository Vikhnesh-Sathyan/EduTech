
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MentorCheatsheetTechnology {
  id: number;
  name: string;
  sort_name: string;
  description: string | null;
  created_by: number | null;
  is_owner: boolean;
}

interface TechnologiesResponse {
  message: string;
  technologies: MentorCheatsheetTechnology[];
}

interface TechnologyResponse {
  message: string;
  technologyId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MentorCheatsheetTechnologyService {
  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:5000/api/mentor/cheatsheet/technologies';

  getTechnologies(): Observable<TechnologiesResponse> {
    return this.http.get<TechnologiesResponse>(this.apiUrl);
  }

  createTechnology(name: string): Observable<TechnologyResponse> {
    return this.http.post<TechnologyResponse>(
      this.apiUrl,
      { name }
    );
  }

  updateTechnology(
    technologyId: number,
    name: string
  ): Observable<TechnologyResponse> {
    return this.http.put<TechnologyResponse>(
      `${this.apiUrl}/${technologyId}`,
      { name }
    );
  }

  deleteTechnology(
    technologyId: number
  ): Observable<TechnologyResponse> {
    return this.http.delete<TechnologyResponse>(
      `${this.apiUrl}/${technologyId}`
    );
  }
}
