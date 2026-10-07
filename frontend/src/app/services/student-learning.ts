import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StudentLearning {

  private apiUrl =
    'http://localhost:5000/api/study';

  constructor(
    private http: HttpClient
  ) {}

  // Get complete learning hierarchy for one subject
  getLearningStructure(subjectId: number) {

    return this.http.get(
      `${this.apiUrl}/subjects/${subjectId}/learning`
    );

  }


  // Get learning content for one section
  getSectionLearningContent(sectionId: number) {

    return this.http.get(
      `http://localhost:5000/api/student/section-learning/${sectionId}`
    );

  }


  // Start or update progress when a student opens a section
  accessSection(sectionId: number) {

    return this.http.post(
      `http://localhost:5000/api/student/section-learning/${sectionId}/access`,
      {}
    );

  }


  // Mark a learning section as completed
  completeSection(sectionId: number) {

    return this.http.put(
      `http://localhost:5000/api/student/section-learning/${sectionId}/complete`,
      {}
    );

  }
  
// Get complete study progress for one subject
getSubjectStudyProgress(subjectId: number) {
  return this.http.get(
    `http://localhost:5000/api/student/section-learning/progress/subject/${subjectId}`
  );
}

// Get the student's current/recent study progress
getCurrentStudyProgress() {
  return this.http.get(
    'http://localhost:5000/api/student/section-learning/progress/current'
  );
}


}
