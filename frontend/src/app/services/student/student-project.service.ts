import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StudentProjectService {

  private apiUrl =
    'http://localhost:5000/api/student/projects';


  constructor(
    private http: HttpClient
  ) {}


  // =====================================================
  // CATEGORIES
  // =====================================================

  // Get active Project Understanding categories
  getCategories() {
    return this.http.get(
      `${this.apiUrl}/categories`
    );
  }


  // =====================================================
  // TOPICS
  // =====================================================

  // Get topics belonging to a category
  getTopics(categoryId: number) {
    return this.http.get(
      `${this.apiUrl}/categories/${categoryId}/topics`
    );
  }


  // =====================================================
  // SECTIONS
  // =====================================================

  // Get sections belonging to a topic
  getSections(topicId: number) {
    return this.http.get(
      `${this.apiUrl}/topics/${topicId}/sections`
    );
  }


  // =====================================================
  // SECTION CONTENT
  // =====================================================

  // Get learning content for a section
  getSectionContent(sectionId: number) {
    return this.http.get(
      `${this.apiUrl}/sections/${sectionId}/content`
    );
  }

}