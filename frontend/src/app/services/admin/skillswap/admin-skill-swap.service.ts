
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminSkillSwapService {

  private readonly apiUrl =
    'http://localhost:5000/api/admin/skillswap/skills';

  constructor(private http: HttpClient) {}

  // Get all skills, including inactive skills
  getAllSkills(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Add a new skill
  addSkill(payload: {
    name: string;
    category?: string;
    description?: string;
  }): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }

  // Update an existing skill
  updateSkill(
    skillId: number,
    payload: {
      name: string;
      category?: string;
      description?: string;
    }
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/${skillId}`, payload);
  }

  // Activate or deactivate a skill
  updateSkillStatus(
    skillId: number,
    status: 'active' | 'inactive'
  ): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${skillId}/status`,
      { status }
    );
  }
}
