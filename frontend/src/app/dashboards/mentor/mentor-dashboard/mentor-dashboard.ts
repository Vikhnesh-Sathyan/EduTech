// Provides the main overview for the mentor

import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Sidebar } from '../components/sidebar/sidebar';

@Component({
  selector: 'app-mentor-dashboard',

  standalone: true,

  imports: [
    RouterLink,
    Sidebar
  ],

  templateUrl: './mentor-dashboard.html',

  styleUrl: './mentor-dashboard.css'
})
export class MentorDashboard implements OnInit {

  // Stores the greeting based on the current time
  greeting = '';

  ngOnInit(): void {

    this.setGreeting();

  }


  // Sets morning, afternoon or evening greeting
  private setGreeting(): void {

    const hour = new Date().getHours();

    if (hour < 12) {

      this.greeting = 'Good morning';

    } else if (hour < 17) {

      this.greeting = 'Good afternoon';

    } else {

      this.greeting = 'Good evening';

    }

  }

}