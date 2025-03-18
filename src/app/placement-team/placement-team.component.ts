import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-placement-team',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './placement-team.component.html',
  styleUrls: ['./placement-team.component.css'], // Ensure the correct file is linked
})
export class PlacementTeamComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router) {}

  onLogin(): void {
    const teamUsername = 'placement123';
    const teamPassword = 'team123';

    // Log input values for debugging
    console.log('Entered Username:', this.username);
    console.log('Entered Password:', this.password);

    if (this.username === teamUsername && this.password === teamPassword) {
      // Store login status in local storage
      localStorage.setItem('isPlacementTeamLoggedIn', 'true');
      // Redirect to placement team dashboard
      this.router.navigate(['placementteam-dashboard']);
    } else {
      // Display an error message for invalid credentials
      this.errorMessage = 'Invalid username or password';
    }
  }

  // Navigation to login page (adjust route if necessary)
  navigateToplacementteamdashboard(): void {
    this.router.navigate(['placementteam-dashboard']);
  }
}
