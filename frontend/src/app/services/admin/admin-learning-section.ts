import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminLearningSection {

  private apiUrl =
    'http://localhost:5000/api/admin/learning-sections';

  constructor(
    private http: HttpClient
  ) {}


  // Get all learning sections for a subtopic
  getLearningSections(subtopicId: number) {

    return this.http.get(
      `${this.apiUrl}/subtopic/${subtopicId}`
    );

  }


  // Create a new learning section
  createLearningSection(data: any) {

    return this.http.post(
      this.apiUrl,
      data
    );

  }


  // Update a learning section
  updateLearningSection(
    sectionId: number,
    data: any
  ) {

    return this.http.put(
      `${this.apiUrl}/${sectionId}`,
      data
    );

  }


  // Enable or disable a learning section
  updateLearningSectionStatus(
    sectionId: number,
    status: string
  ) {

    return this.http.patch(
      `${this.apiUrl}/${sectionId}/status`,
      {
        status
      }
    );

  }

}