
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

export interface AdvancedModuleProgress {
  module_id: number;
  module_type: string;
  display_order: number;
  completed: boolean;
  completed_at: string | null;
}

export interface AdvancedProgressResponse {
  subtopicId: number;
  advancedUnlocked: boolean;
  totalModules: number;
  completedModules: number;
  progressPercentage: number;
  modules: AdvancedModuleProgress[];
}

@Injectable({
  providedIn: 'root'
})
export class StudentAdvancedService {

  private apiUrl = 'http://localhost:5000/api/student/advanced';

  constructor(private http: HttpClient) {}

  // Load Advanced Learning content
  getAdvancedLearning(subtopicId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${subtopicId}`
    );
  }

  // Load completion status for Advanced modules
  getAdvancedModuleProgress(
    subtopicId: number
  ): Observable<AdvancedProgressResponse> {
    return this.http.get<AdvancedProgressResponse>(
      `${this.apiUrl}/${subtopicId}/progress`
    );
  }

  // Mark an Advanced module as completed
  completeAdvancedModule(
    subtopicId: number,
    moduleId: number
  ): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${subtopicId}/modules/${moduleId}/complete`,
      {}
    );
  }
}
