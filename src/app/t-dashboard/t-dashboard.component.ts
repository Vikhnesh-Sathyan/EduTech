import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-t-dashboard',
  templateUrl: './t-dashboard.component.html',
  styleUrls: ['./t-dashboard.component.css']
})
export class TDashboardComponent {
  darkMode: boolean = false; // Default dark mode is off

  constructor(private router: Router) {}

  toggleDarkMode() {
    this.darkMode = !this.darkMode; // Toggle dark mode
  }

  goToResources() {
    this.router.navigate(['resources']); // Navigate to resources page
  }
}
