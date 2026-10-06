// Provides the main overview for the mentor

import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { Sidebar } from '../components/sidebar/sidebar';
import { Mentor } from '../../../services/mentor';


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
  greeting = signal('');

  // Stores the actual mentor verification status
  verificationStatus = signal('');

  // Stores the rejection reason if the profile was rejected
  verificationNote = signal('');

  // Controls whether the verification popup is visible
  showVerificationPopup = signal(false);


  constructor(
    private router: Router,
    private mentorService: Mentor
  ) {}


  ngOnInit(): void {

    this.setGreeting();

    this.loadDashboard();

  }


  // Sets morning, afternoon or evening greeting
  private setGreeting(): void {

    const hour = new Date().getHours();

    if (hour < 12) {

      this.greeting.set('Good morning');

    } else if (hour < 17) {

      this.greeting.set('Good afternoon');

    } else {

      this.greeting.set('Good evening');

    }

  }


  // Loads the mentor dashboard data from the backend
  private loadDashboard(): void {

    this.mentorService.getDashboard().subscribe({

      next: (response: any) => {

        console.log(
          'MENTOR DASHBOARD RESPONSE:',
          response
        );

        this.verificationStatus.set(
          response.verificationStatus
        );

        this.verificationNote.set(
          response.verificationNote || ''
        );

        this.checkVerificationStatus();

      },

      error: (error) => {

        console.error(
          'Failed to load mentor dashboard:',
          error
        );

      }

    });

  }


  // Shows verification popup only when mentor is not approved
  private checkVerificationStatus(): void {

    const status = this.verificationStatus();

    if (
      status === 'pending' ||
      status === 'rejected'
    ) {

      this.showVerificationPopup.set(true);

    } else {

      this.showVerificationPopup.set(false);

    }

  }


  // Opens the mentor profile for verification
  continueVerification(): void {

    this.showVerificationPopup.set(false);

    this.router.navigate(['/mentor-profile']);

  }


  // Closes the verification popup
  closeVerificationPopup(): void {

    this.showVerificationPopup.set(false);

  }

}