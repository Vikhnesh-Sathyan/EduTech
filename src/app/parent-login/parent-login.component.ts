declare var google: any;


import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-parent-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './parent-login.component.html',
  styleUrls: ['./parent-login.component.css']
})
export class ParentLoginComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  signUpForm!: FormGroup;
  signInForm!: FormGroup;
  
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Initialize the forms
    this.signUpForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });

    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

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

  handleLogin(response: any): void {
    if (response && response.credential) {
      const payLoad = this.decodeToken(response.credential);
      if (payLoad) {
        sessionStorage.setItem('loggedInUser', JSON.stringify(payLoad));
        this.router.navigate(['parent-login/p-dashboard']);
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

  handleSubmitSignUp(): void {
    if (this.signUpForm.valid) {
      const { username, email, password, confirmPassword } = this.signUpForm.value;
      this.http.post(`${this.apiUrl}/parent-signup`, { username, email, password, confirmPassword }, { responseType: 'text' })
        .subscribe(response => {
          console.log('Sign-up successful', response);
        }, error => {
          console.error('Sign-up error', error);
        });
    } else {
      console.error('Sign-up form is invalid');
    }
  }

  handleSubmitSignIn(): void {
    if (this.signInForm.valid) {
      const { email, password } = this.signInForm.value;
      this.http.post(`${this.apiUrl}/parent-signin`, { email, password }, { responseType: 'text' })
        .subscribe(response => {
          console.log('Sign-in successful', response);
          try {
            const parsedResponse = JSON.parse(response);
            if (parsedResponse && parsedResponse.user) {
              sessionStorage.setItem('loggedInUser', JSON.stringify(parsedResponse.user));
              this.router.navigate(['parent-login/p-dashboard']);
            }
          } catch (e) {
            console.error('Error parsing response:', e);
          }
        }, error => {
          console.error('Sign-in error', error);
        });
    } else {
      console.error('Sign-in form is invalid');
    }
  }

  forgotPassword(): void {
    this.router.navigate(['forgot-password']);
  }

  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}
