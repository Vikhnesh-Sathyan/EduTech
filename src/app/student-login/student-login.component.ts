declare var google: any;

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './student-login.html',
  styleUrls: ['./student-login.component.css']
})
export class StudentLoginComponent implements OnInit {
  
  private router = inject(Router);
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/api';

  constructor() {}

  ngOnInit(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '768539892216-0qtcb4267ggt7hivd8r2vhva0vmnr85b.apps.googleusercontent.com', // Replace with your Google client ID
        callback: (response: any) => {
          console.log('Google sign-in response:', response);
          this.handleGoogleLogin(response);
        }
      });

      google.accounts.id.renderButton(
        document.getElementById('google-btn'),
        {
          theme: 'filled_blue',
          size: 'large',
          shape: 'rectangle',
          width: 350
        }
      );
    } else {
      console.error('Google API not loaded');
    }
  }

  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  private handleGoogleLogin(response: any): void {
    if (response && response.credential) {
      const payLoad = this.decodeToken(response.credential);
      if (payLoad) {
        sessionStorage.setItem('loggedInUser', JSON.stringify(payLoad));
        this.router.navigate(['student-login/dashboard']);
      } else {
        console.error('Invalid token payload');
      }
    } else {
      console.error('Google login response is invalid');
    }
  }


  togglePanel(panel: string): void {
    const mainContainer = document.getElementById('main');
    if (panel === 'signUp') {
      mainContainer?.classList.add('right-panel-active');
    } else if (panel === 'signIn') {
      mainContainer?.classList.remove('right-panel-active');
    }
  }

  // Handle form submission
  // Handle form submission
handleSubmit(event: Event, formType: string): void {
  event.preventDefault(); // Prevent default form submission behavior

  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);

  if (formType === 'signUp') {
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    this.http.post(`${this.apiUrl}/student-signup`, { username, email, password, confirmPassword }, { responseType: 'text' })
      .subscribe(response => {
        console.log('Sign-up successful', response);
        // Automatically log the user in after successful sign-up
        this.handleLoginAfterSignUp({ email, password });
      }, error => {
        console.error('Sign-up error', error);
        // Handle sign-up error (e.g., show an error message)
      });
  } else if (formType === 'signIn') {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    this.http.post(`${this.apiUrl}/student-signin`, { email, password }, { responseType: 'text' })
      .subscribe(response => {
        console.log('Sign-in successful', response);
        try {
          // Parse the response if it's JSON formatted
          const parsedResponse = JSON.parse(response);
          if (parsedResponse && parsedResponse.user) {
            sessionStorage.setItem('loggedInUser', JSON.stringify(parsedResponse.user));
            // Navigate to the "personal" page after successful login
            this.router.navigate(['student-login/personal']);
          }
        } catch (e) {
          // Handle case where the response is not JSON
          console.error('Error parsing response:', e);
        }
      }, error => {
        console.error('Sign-in error', error);
      });
  }
}

// Handle login after sign-up
private handleLoginAfterSignUp(userData: any): void {
  const { email, password } = userData;
  this.http.post(`${this.apiUrl}/student-signin`, { email, password }, { responseType: 'text' })
    .subscribe(
      signinResponse => {
        console.log('Automatic sign-in successful', signinResponse);
        try {
          // Parse the response if needed
          const parsedResponse = JSON.parse(signinResponse);
          if (parsedResponse && parsedResponse.user) {
            sessionStorage.setItem('loggedInUser', JSON.stringify(parsedResponse.user));
            // Redirect to the personal page after automatic sign-in
            this.router.navigate(['personal']);
          }
        } catch (e) {
          console.error('Error parsing automatic sign-in response:', e);
        }
      },
      signinError => {
        console.error('Automatic sign-in error', signinError);
      }
    );
}

}
