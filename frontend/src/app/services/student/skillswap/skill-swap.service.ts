
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SkillSwapService {

  private readonly apiUrl = 'http://localhost:5000/api/student/skillswap';

  constructor(private http: HttpClient) {}

  // Get all active skills
  getAvailableSkills(): Observable<any> {
    return this.http.get(`${this.apiUrl}/skills`);
  }

  // Get the logged-in student's skills
  getMySkills(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-skills`);
  }

  // Save teaching and learning skills
  saveMySkills(skills: {
    skill_id: number;
    skill_type: 'teach' | 'learn';
    proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | null;
  }[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/my-skills`, { skills });
  }

  // Remove one of the student's skills
  removeMySkill(
    skillId: number,
    skillType: 'teach' | 'learn'
  ): Observable<any> {
    return this.http.delete(`${this.apiUrl}/my-skills/${skillId}`, {
      body: { skill_type: skillType }
    });
  }

  
suggestSkill(payload: {
  name: string;
  category?: string;
  description?: string;
}): Observable<any> {
  return this.http.post(
    `${this.apiUrl}/suggestions`,
    payload
  );
}

getMySkillSuggestions(): Observable<any> {
  return this.http.get(`${this.apiUrl}/suggestions`);
}

  // Discover students and find reciprocal skill matches
  discoverStudents(skillId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/discover`,
      {
        params: {
          skill_id: skillId
        }
      }
    );
  }


}
