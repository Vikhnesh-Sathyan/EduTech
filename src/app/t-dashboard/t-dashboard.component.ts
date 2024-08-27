import { Component } from '@angular/core';

@Component({
  selector: 'app-t-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './t-dashboard.component.html',
  styleUrl: './t-dashboard.component.css'
})
export class TDashboardComponent {

  darkMode = false;

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    const body = document.body;
    body.classList.toggle('dark-mode', this.darkMode);
  }
}
