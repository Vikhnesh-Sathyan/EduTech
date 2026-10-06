import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminProjectService {

  private apiUrl =
    'http://localhost:5000/api/admin/projects';


  // =====================================================
  // CATEGORY
  // =====================================================

  // Get all project categories
  getCategories() {
    return this.http.get(
      `${this.apiUrl}/categories`
    );
  }


  // Create a project category
  createCategory(data: any) {
    return this.http.post(
      `${this.apiUrl}/categories`,
      data
    );
  }


  // Update a project category
  updateCategory(
    categoryId: number,
    data: any
  ) {
    return this.http.put(
      `${this.apiUrl}/categories/${categoryId}`,
      data
    );
  }


  // Delete a project category
  deleteCategory(categoryId: number) {
    return this.http.delete(
      `${this.apiUrl}/categories/${categoryId}`
    );
  }


  // =====================================================
  // TOPIC
  // =====================================================

  // Get topics belonging to a category
  getTopics(categoryId: number) {
    return this.http.get(
      `${this.apiUrl}/categories/${categoryId}/topics`
    );
  }


  // Create a topic inside a category
  createTopic(
    categoryId: number,
    data: any
  ) {
    return this.http.post(
      `${this.apiUrl}/categories/${categoryId}/topics`,
      data
    );
  }


  // Update an existing topic
  updateTopic(
    topicId: number,
    data: any
  ) {
    return this.http.put(
      `${this.apiUrl}/topics/${topicId}`,
      data
    );
  }


  // Delete an existing topic
  deleteTopic(topicId: number) {
    return this.http.delete(
      `${this.apiUrl}/topics/${topicId}`
    );
  }


  constructor(
    private http: HttpClient
  ) {}
// =====================================================
// SECTION
// =====================================================

// Get sections belonging to a topic
getSections(topicId: number) {
  return this.http.get(
    `${this.apiUrl}/topics/${topicId}/sections`
  );
}


// Create a section inside a topic
createSection(
  topicId: number,
  data: any
) {
  return this.http.post(
    `${this.apiUrl}/topics/${topicId}/sections`,
    data
  );
}


// Update an existing section
updateSection(
  sectionId: number,
  data: any
) {
  return this.http.put(
    `${this.apiUrl}/sections/${sectionId}`,
    data
  );
}


// Delete an existing section
deleteSection(sectionId: number) {
  return this.http.delete(
    `${this.apiUrl}/sections/${sectionId}`
  );
}

// =====================================================
// SECTION CONTENT
// =====================================================

getSectionContent(sectionId: number) {
  return this.http.get(
    `${this.apiUrl}/sections/${sectionId}/content`
  );
}

createSectionContent(
  sectionId: number,
  data: any
) {
  return this.http.post(
    `${this.apiUrl}/sections/${sectionId}/content`,
    data
  );
}

updateSectionContent(
  sectionId: number,
  data: any
) {
  return this.http.put(
    `${this.apiUrl}/sections/${sectionId}/content`,
    data
  );
}

uploadSectionImage(sectionId: number, formData: FormData) {
  return this.http.post(
    `${this.apiUrl}/sections/${sectionId}/content/image`,
    formData
  );
}
}