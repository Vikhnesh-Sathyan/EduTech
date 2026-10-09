import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminSubtopic {

  private apiUrl =
    'http://localhost:5000/api/admin/subtopics';

  constructor(
    private http: HttpClient
  ) {}


  // Get all subtopics for a topic
  getSubtopics(topicId: number) {
    return this.http.get(
      `${this.apiUrl}/topic/${topicId}`
    );
  }


  // Create a new subtopic
  createSubtopic(data: any) {
    return this.http.post(
      this.apiUrl,
      data
    );
  }


  // Update a subtopic
  updateSubtopic(
    subtopicId: number,
    data: any
  ) {
    return this.http.put(
      `${this.apiUrl}/${subtopicId}`,
      data
    );
  }


  // Enable or disable a subtopic
  updateSubtopicStatus(
    subtopicId: number,
    status: string
  ) {
    return this.http.patch(
      `${this.apiUrl}/${subtopicId}/status`,
      {
        status
      }
    );
  }

    // ======================================================
  // ADVANCED LEARNING
  // ======================================================

  // Get Advanced setup for a subtopic
  getAdvancedSetup(subtopicId: number) {
    return this.http.get(
      `${this.apiUrl}/${subtopicId}/advanced`
    );
  }


  // Create Advanced setup with selected modules
  createAdvancedSetup(
    subtopicId: number,
    modules: string[]
  ) {
    return this.http.post(
      `${this.apiUrl}/${subtopicId}/advanced`,
      {
        subtopicId,
        modules
      }
    );
  }


  // Get content for an Advanced module
  getAdvancedModuleContent(moduleId: number) {
    return this.http.get(
      `${this.apiUrl}/advanced/modules/${moduleId}/content`
    );
  }


  // Create or update Advanced module content
  saveAdvancedModuleContent(
    moduleId: number,
    contentData: any
  ) {
    return this.http.put(
      `${this.apiUrl}/advanced/modules/${moduleId}/content`,
      {
        contentData
      }
    );
  }
updateAdvancedSetup(
  subtopicId: number,
  modules: string[]
) {
  return this.http.put(
    `${this.apiUrl}/${subtopicId}/advanced`,
    {
      modules
    }
  );
}

}