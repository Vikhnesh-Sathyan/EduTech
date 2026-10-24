
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminSubtopic {

  private apiUrl =
    'http://localhost:5000/api/admin/subtopics';

  private advancedApiUrl =
    'http://localhost:5000/api/admin/advanced';

  constructor(
    private http: HttpClient
  ) {}

  // ======================================================
  // SUBTOPIC MANAGEMENT
  // ======================================================

  getSubtopics(topicId: number) {
    return this.http.get(
      `${this.apiUrl}/topic/${topicId}`
    );
  }

  createSubtopic(data: any) {
    return this.http.post(
      this.apiUrl,
      data
    );
  }

  updateSubtopic(
    subtopicId: number,
    data: any
  ) {
    return this.http.put(
      `${this.apiUrl}/${subtopicId}`,
      data
    );
  }

  updateSubtopicStatus(
    subtopicId: number,
    status: string
  ) {
    return this.http.patch(
      `${this.apiUrl}/${subtopicId}/status`,
      { status }
    );
  }

  // ======================================================
  // ADVANCED LEARNING — SECTION-SPECIFIC SETUP
  // ======================================================

  // Get Advanced setup for a section
  getAdvancedSetup(sectionId: number) {
    return this.http.get(
      `${this.advancedApiUrl}/${sectionId}`
    );
  }

  // Create Advanced setup for a section
  createAdvancedSetup(
    sectionId: number,
    modules: string[]
  ) {
    return this.http.post(
      this.advancedApiUrl,
      {
        sectionId,
        modules
      }
    );
  }

  // Update Advanced setup for a section
  updateAdvancedSetup(
    sectionId: number,
    modules: string[]
  ) {
    return this.http.put(
      `${this.advancedApiUrl}/${sectionId}`,
      { modules }
    );
  }

  // ======================================================
  // ADVANCED MODULE CONTENT
  // ======================================================

  getAdvancedModuleContent(moduleId: number) {
    return this.http.get(
      `${this.advancedApiUrl}/modules/${moduleId}/content`
    );
  }

  saveAdvancedModuleContent(
    moduleId: number,
    contentData: any
  ) {
    return this.http.put(
      `${this.advancedApiUrl}/modules/${moduleId}/content`,
      { contentData }
    );
  }

  getSubtopicsForMentor(topicId: number) {
  return this.http.get<{ subtopics: any[] }>(
    `http://localhost:5000/api/admin/subtopics/mentor/topic/${topicId}`
  );
}
}
