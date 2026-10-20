
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StudentCheatsheetTechnology {
  id: number;
  name: string;
  sort_name: string;
  description: string | null;
}

export interface StudentCheatsheetCategory {
  id: number;
  technology_id: number;
  name: string;
  display_order: number;
}

export interface StudentCheatsheetTopic {
  id: number;
  category_id: number;
  name: string;
  definition: string;
  code_example: string | null;
  memory_trick: string | null;
  expected_output: string | null;
  display_order: number;
}

export interface StudentCheatsheetSubtopic {
  id: number;
  topic_id: number;
  name: string;
  definition: string;
  code_example: string | null;
  memory_trick: string | null;
  expected_output: string | null;
  display_order: number;
}

@Injectable({
  providedIn: 'root'
})
export class StudentCheatsheetService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5000/api/student/cheatsheet';

  getTechnologies(): Observable<{ message: string; technologies: StudentCheatsheetTechnology[] }> {
    return this.http.get<{ message: string; technologies: StudentCheatsheetTechnology[] }>(
      `${this.apiUrl}/technologies`
    );
  }

  getCategories(technologyId: number): Observable<{ message: string; categories: StudentCheatsheetCategory[] }> {
    return this.http.get<{ message: string; categories: StudentCheatsheetCategory[] }>(
      `${this.apiUrl}/technologies/${technologyId}/categories`
    );
  }

  getTopics(categoryId: number): Observable<{ message: string; topics: StudentCheatsheetTopic[] }> {
    return this.http.get<{ message: string; topics: StudentCheatsheetTopic[] }>(
      `${this.apiUrl}/categories/${categoryId}/topics`
    );
  }

  getSubtopics(topicId: number): Observable<{ message: string; subtopics: StudentCheatsheetSubtopic[] }> {
    return this.http.get<{ message: string; subtopics: StudentCheatsheetSubtopic[] }>(
      `${this.apiUrl}/topics/${topicId}/subtopics`
    );
  }
}
