import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'  // Ensure the service is available application-wide
})
export class AuthService {
  private studentData = {
    student_name: "",
    dob: "",  // Remove string interpolation
    gender: "",
    email: "",
    phone: "",
    address: "",
    guardian_name: "",
    grade: ""
  };

  constructor(private router: Router) {}

  // Method for signing out
  signOut() {
    // Clear all authentication data
    localStorage.removeItem('userToken'); // or sessionStorage.removeItem('userToken');
    
    // Navigate to login page
    this.router.navigate(['student-login']).then(() => {
      // Optionally, reload the page to clear the history
      window.location.reload();
    });
  }

  // Method to check if the user is authenticated
  isAuthenticated(): boolean {
    // Implement logic to check if the user is authenticated
    return !!localStorage.getItem('userToken'); // returns true if there's a token
  }

  getStudentInfo() {
    // Return the simulated student data or fetch it from an API
    return this.studentData;
  }
}
