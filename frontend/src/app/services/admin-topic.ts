import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminTopic {

  private apiUrl =
    'http://localhost:5000/api/admin/topics';

  constructor(private http: HttpClient) {}

  // Get topics for a subject
  getTopicsBySubject(subjectId: number) {
    return this.http.get(
      `${this.apiUrl}/subject/${subjectId}`
    );
  }

  // Create a new topic
  createTopic(data: any) {
    return this.http.post(
      this.apiUrl,
      data
    );
  }

  //update the topic
 updateTopic(topicId: number, data: any) {
  return this.http.put(
    `${this.apiUrl}/${topicId}`,
    data
  );
}

}