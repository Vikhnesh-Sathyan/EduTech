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

  
// Gets the full public profile of one mentor
getMentorProfile(mentorId: number) {

  return this.http.get(
    `${this.apiUrl}/${mentorId}`
  );

}


// Gets the student's currently connected mentor
getMyMentor() {
  return this.http.get(
    `${this.apiUrl}/my-mentor`
  );
}

// Gets mentors recommended for the current student
getMentorRecommendations() {
  return this.http.get(
    `${this.apiUrl}/recommendations`
  );
}

getPreviousMentors() {
  return this.http.get(
    `${this.apiUrl}/previous`
  );

}

}