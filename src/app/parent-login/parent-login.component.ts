declare var google: any;

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-parent-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './parent-login.component.html',
  styleUrls: ['./parent-login.component.css']
})
export class ParentLoginComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/api'; // API endpoint for parent login/signup

  constructor() {}

  ngOnInit(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '768539892216-0qtcb4267ggt7hivd8r2vhva0vmnr85b.apps.googleusercontent.com',
        callback: (response: any) => {
          console.log('Google sign-in response:', response);
          this.handleLogin(response);
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

  handleLogin(response: any): void {
    if (response && response.credential) {
      const payLoad = this.decodeToken(response.credential);
      if (payLoad) {
        sessionStorage.setItem('loggedInUser', JSON.stringify(payLoad));
        this.router.navigate(['parent-login/p-dashboard']); // Navigate to parent dashboard
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
  handleSubmit(event: Event, formType: string): void {
    event.preventDefault(); // Prevent default form submission behavior

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    if (formType === 'signUp') {
      const username = formData.get('username') as string;
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const confirmPassword = formData.get('confirmPassword') as string;

      this.http.post(`${this.apiUrl}/parent-signup`, { username, email, password, confirmPassword }, { responseType: 'text' })
        .subscribe(response => {
          console.log('Sign-up successful', response);
          // Handle sign-up success (e.g., show a success message or redirect)
        }, error => {
          console.error('Sign-up error', error);
          // Handle sign-up error (e.g., show an error message)
        });
    } else if (formType === 'signIn') {
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      this.http.post(`${this.apiUrl}/parent-signin`, { email, password }, { responseType: 'text' })
        .subscribe(response => {
          console.log('Sign-in successful', response);
          try {
            // Try to parse the response if it is in JSON format
            const parsedResponse = JSON.parse(response);
            if (parsedResponse && parsedResponse.user) {
              sessionStorage.setItem('loggedInUser', JSON.stringify(parsedResponse.user));
              this.router.navigate(['parent-login/p-dashboard']); // Navigate to parent dashboard
            }
          } catch (e) {
            // Handle non-JSON response
            console.error('Error parsing response:', e);
          }
        }, error => {
          console.error('Sign-in error', error);
        });
    }
  }
  forgotpassword()
  {
    this.router.navigate(['forgot-password']);
  }
}
