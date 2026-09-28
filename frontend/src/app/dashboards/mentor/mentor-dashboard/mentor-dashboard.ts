// Provides the main overview for the mentor
import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { Sidebar } from '../components/sidebar/sidebar';

@Component({
  selector: 'app-mentor-dashboard',

  standalone: true,

  imports: [
    RouterLink,
    Sidebar,
    NgIf
  ],

  templateUrl: './mentor-dashboard.html',

  styleUrl: './mentor-dashboard.css'
})
export class MentorDashboard implements OnInit {

  // Stores the greeting based on the current time
  greeting = '';

  // Controls whether the verification popup is visible
  showVerificationPopup = false;

  constructor(private router: Router) {}

  ngOnInit(): void {

    this.setGreeting();

    this.checkVerificationStatus();

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


  // Checks the mentor verification status
  private checkVerificationStatus(): void {

    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      return;
    }

    const user = JSON.parse(storedUser);

    if (
      user.role === 'mentor' &&
      user.verificationStatus !== 'approved'
    ) {

      this.showVerificationPopup = true;

    }

  }


  // Opens the mentor profile for verification
  continueVerification(): void {

    this.showVerificationPopup = false;

    this.router.navigate(['/mentor-profile']);

  }


  // Closes the popup
  closeVerificationPopup(): void {

    this.showVerificationPopup = false;

  }

}