import { Component } from '@angular/core';
import { Sidebar } from '../components/sidebar/sidebar';
import { Topbar } from '../components/topbar/topbar';
import { WelcomeSection } from '../components/welcome-section/welcome-section';
import { CurrentFocus } from '../components/current-focus/current-focus';

@Component({
  selector: 'app-student-dashboard',
  imports: [Sidebar, Topbar, WelcomeSection, CurrentFocus],
  templateUrl: './student-dashboard.html',
  styleUrl: './student-dashboard.css',
})
export class StudentDashboard {

  userName = '';

  constructor() {

    const user = localStorage.getItem('user');

    if (user) {
      const userData = JSON.parse(user);
      this.userName = userData.name;
    }

  }

}