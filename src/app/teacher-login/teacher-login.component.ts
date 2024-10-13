declare var google: any;

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import ReactiveFormsModule and FormBuilder
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-teacher-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './teacher-login.component.html',
  styleUrls: ['./teacher-login.component.css']
})
export class TeacherLoginComponent implements OnInit {

  signUpForm!: FormGroup;  // Form group for sign-up
  signInForm!: FormGroup;  // Form group for sign-in

  private router = inject(Router);
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  constructor(private fb: FormBuilder) { }  // Inject FormBuilder

  ngOnInit(): void {
    this.initializeForms();  // Initialize forms
    // Google sign-in logic (remains the same)
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

  // Initialize forms
  private initializeForms(): void {
    this.signUpForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator }); // Add custom validator for password matching

    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  // Custom validator for matching passwords
  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  handleLogin(response: any): void {
    if (response && response.credential) {
      const payLoad = this.decodeToken(response.credential);
      if (payLoad) {
        sessionStorage.setItem('loggedInUser', JSON.stringify(payLoad));
        this.router.navigate(['teacher-login/t-dashboard']);
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
  handleSubmit(formType: string): void {
    if (formType === 'signUp') {
      if (this.signUpForm.valid) {
        const formData = this.signUpForm.value;
        const { username, email, password, confirmPassword } = formData;

        this.http.post(`${this.apiUrl}/teacher-signup`, { username, email, password, confirmPassword }, { responseType: 'text' })
          .subscribe(response => {
            console.log('Sign-up successful', response);
          }, error => {
            console.error('Sign-up error', error);
          });
      } else {
        console.log('Sign-up form is invalid.');
      }
    } else if (formType === 'signIn') {
      if (this.signInForm.valid) {
        const { email, password } = this.signInForm.value;

        this.http.post(`${this.apiUrl}/teacher-signin`, { email, password }, { responseType: 'text' })
          .subscribe(response => {
            console.log('Sign-in successful', response);
            try {
              const parsedResponse = JSON.parse(response);
              if (parsedResponse && parsedResponse.user) {
                sessionStorage.setItem('loggedInUser', JSON.stringify(parsedResponse.user));
                this.router.navigate(['teacher-login/t-dashboard']);
              }
            } catch (e) {
              console.error('Error parsing response:', e);
            }
          }, error => {
            console.error('Sign-in error', error);
          });
      } else {
        console.log('Sign-in form is invalid.');
      }
    }
  }

  decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}
