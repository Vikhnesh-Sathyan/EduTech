
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MentorCheatsheetTechnology {
  id: number;
  name: string;
  sort_name: string;
  description: string | null;
}

interface TechnologiesResponse {
  message: string;
  technologies: MentorCheatsheetTechnology[];
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
}
