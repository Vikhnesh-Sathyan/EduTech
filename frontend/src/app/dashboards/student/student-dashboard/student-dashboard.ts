import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';

import { Sidebar } from '../components/sidebar/sidebar';
import { Topbar } from '../components/topbar/topbar';
import { WelcomeSection } from '../components/welcome-section/welcome-section';
import { CurrentFocus } from '../components/current-focus/current-focus';

import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    Sidebar,
    Topbar,
    WelcomeSection,
    CurrentFocus
  ],
  templateUrl: './student-dashboard.html',
  styleUrl: './student-dashboard.css',
})
export class StudentDashboard {

  userName = signal('');

  constructor(
    private auth: Auth,
    private router: Router
  ) {
    this.auth.getMe().subscribe({
      next: (response: any) => {
        console.log('ME RESPONSE:', response);

        this.userName.set(response.user.name);

        console.log('USER NAME:', this.userName());
      },
      error: (error) => {
        console.error('Failed to load user:', error);
      }
    });
  }

  // Navigate to the Learning Resources page
  openLearningResources(): void {
    this.router.navigate(['/learning-resources']);
  }
}
