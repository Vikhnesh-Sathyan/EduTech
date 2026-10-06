// Handles mentor discovery and mentorship communication for students

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StudentMentorService {

  private apiUrl = 'http://localhost:5000/api/student/mentors';

  constructor(private http: HttpClient) {}

  // Get all approved mentors available to students
  getMentors() {
    return this.http.get(`${this.apiUrl}`);
  }

  // Send a mentorship request to a selected mentor
  requestMentorship(mentorId: number) {
    return this.http.post(
      'http://localhost:5000/api/mentor-student/request',
      {
        mentorId
      }
    );
  }
}