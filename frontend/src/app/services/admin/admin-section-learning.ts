import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminSectionLearning {

  private apiUrl =
    'http://localhost:5000/api/admin/section-learning';

  constructor(
    private http: HttpClient
  ) {}


  // Get learning content for a section
  getSectionLearningContent(sectionId: number) {

    return this.http.get(
      `${this.apiUrl}/section/${sectionId}`
    );

  }


  // Create learning content for a section
  createSectionLearningContent(data: any) {

    return this.http.post(
      this.apiUrl,
      data
    );

  }


  // Update learning content for a section
  updateSectionLearningContent(
    sectionId: number,
    data: any
  ) {

    return this.http.put(
      `${this.apiUrl}/section/${sectionId}`,
      data
    );

  }

}