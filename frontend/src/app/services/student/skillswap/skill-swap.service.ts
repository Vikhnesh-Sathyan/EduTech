
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SkillSwapService {

  private readonly apiUrl = 'http://localhost:5000/api/student/skillswap';

  private readonly requestUrl = `${this.apiUrl}/requests`;

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

  // Suggest a new skill
  suggestSkill(payload: {
    name: string;
    category?: string;
    description?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/suggestions`, payload);
  }

  // Get my skill suggestions
  getMySkillSuggestions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/suggestions`);
  }

  // Discover students
  discoverStudents(skillId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/discover`, {
      params: { skill_id: skillId }
    });
  }

  // ==========================================
  // SKILL SWAP REQUESTS
  // ==========================================

  // Send a learning or mutual exchange request
  sendSwapRequest(payload: {
    receiver_id: number;
    request_type: 'learning' | 'mutual_exchange';
    learn_skill_id: number;
    teach_skill_id?: number | null;
    message?: string | null;
  }): Observable<any> {
    return this.http.post(this.requestUrl, payload);
  }

  // Get incoming and outgoing requests
  getMySwapRequests(): Observable<any> {
    return this.http.get(this.requestUrl);
  }

  // Accept or reject an incoming request
  respondToSwapRequest(
    requestId: number,
    status: 'accepted' | 'rejected'
  ): Observable<any> {
    return this.http.patch(
      `${this.requestUrl}/${requestId}/respond`,
      { status }
    );
  }

  // Cancel an outgoing pending request
  cancelSwapRequest(requestId: number): Observable<any> {
    return this.http.patch(
      `${this.requestUrl}/${requestId}/cancel`,
      {}
    );
  }

  
  // ==========================================
  // SKILL SWAP SESSIONS
  // ==========================================

  private readonly sessionUrl = `${this.apiUrl}/sessions`;

  getMySwapSessions(): Observable<any> {
    return this.http.get(this.sessionUrl);
  }

  scheduleSwapSession(payload: {
    request_id: number;
    scheduled_at: string;
    duration_minutes: number;
    meeting_type: 'online' | 'in_person';
    meeting_link?: string | null;
    location?: string | null;
    notes?: string | null;
  }): Observable<any> {
    return this.http.post(this.sessionUrl, payload);
  }

  cancelSwapSession(sessionId: number): Observable<any> {
    return this.http.patch(
      `${this.sessionUrl}/${sessionId}/cancel`,
      {}
    );
  }

  completeSwapSession(sessionId: number): Observable<any> {
    return this.http.patch(
      `${this.sessionUrl}/${sessionId}/complete`,
      {}
    );
  }

}
