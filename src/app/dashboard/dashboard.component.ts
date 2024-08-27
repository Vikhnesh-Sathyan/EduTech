import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Ensure this import is present


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  constructor(private router: Router) {}

  logout() {
    // Implement your logout logic here
    // For example, clear user data, tokens, etc.

    // Redirect to login page
    this.router.navigate(['/student-login']); // Adjust the path as needed
  }
}

