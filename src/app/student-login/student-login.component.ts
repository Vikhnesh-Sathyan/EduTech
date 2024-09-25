declare var google: any;

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-student-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, ReactiveFormsModule],
  templateUrl: './student-login.html',
  styleUrls: ['./student-login.component.css']
})
export class StudentLoginComponent implements OnInit {

  private router = inject(Router);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  private apiUrl = 'http://localhost:3000/api';
  signupForm!: FormGroup;
  signinForm!: FormGroup;

  constructor() {}

  ngOnInit(): void {
    this.initForms();

    // Check if Google API is loaded and initialize Google sign-in
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '768539892216-0qtcb4267ggt7hivd8r2vhva0vmnr85b.apps.googleusercontent.com',
        callback: (response: any) => {
          console.log('Google sign-in response:', response);
          this.handleGoogleLogin(response);
        }
      });

      // Render the Google sign-in button
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

  // Utility method to decode JWT
  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Handle Google login response
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

  // Initialize the signup and signin forms with validators
  private initForms(): void {
    this.signupForm = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(15),
          this.noSpaces,
          this.startsWithSpecial,
          this.isValidCharacters,
          this.usernameTaken
        ]
      ],
      email: [
        '', 
        [
          Validators.required,
          Validators.email,
          this.emailDomainValidator
        ]
      ],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });

    this.signinForm = this.fb.group({
      email: [
        '', 
        [
          Validators.required,
          Validators.email,
          this.emailDomainValidator
        ]
      ],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Validator to check allowed email domains
  private emailDomainValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const email = control.value;
    const allowedDomains = ['example.com', 'edu', 'gmail.com'];
    if (email) {
      const domain = email.substring(email.lastIndexOf('@') + 1);
      return allowedDomains.includes(domain) ? null : { invalidDomain: true };
    }
    return null;
  }

  // Custom validators
  private noSpaces(control: AbstractControl): { [key: string]: boolean } | null {
    const hasSpaces = /\s/.test(control.value);
    return hasSpaces ? { noSpaces: true } : null;
  }

  private startsWithSpecial(control: AbstractControl): { [key: string]: boolean } | null {
    const specialCharPattern = /^[^a-zA-Z0-9]/;
    return specialCharPattern.test(control.value) ? { startsWithSpecial: true } : null;
  }

  private isValidCharacters(control: AbstractControl): { [key: string]: boolean } | null {
    const validCharactersPattern = /^[a-zA-Z0-9_]+$/;
    return validCharactersPattern.test(control.value) ? null : { invalidCharacters: true };
  }

  private usernameTaken(control: AbstractControl): { [key: string]: boolean } | null {
    const takenUsernames = ['user1', 'user2', 'admin'];
    return takenUsernames.includes(control.value) ? { usernameTaken: true } : null;
  }

  // Handle form submission
  onSubmit(event: Event): void {
    event.preventDefault();
    if (this.signupForm.valid) {
      console.log('Form Submitted', this.signupForm.value);
      // Add your form submission logic here
    } else {
      console.error('Form is invalid');
    }
  }

  // Toggle between sign-up and sign-in panels
  togglePanel(panel: string): void {
    const mainContainer = document.getElementById('main');
    if (panel === 'signUp') {
      mainContainer?.classList.add('right-panel-active');
    } else if (panel === 'signIn') {
      mainContainer?.classList.remove('right-panel-active');
    }
  }

  // Handle form submission based on form type (sign-up or sign-in)
  handleSubmit(formType: string): void {
    if (formType === 'signUp') {
      if (this.signupForm.valid) {
        const { username, email, password, confirmPassword } = this.signupForm.value;

        // Call backend to register user
        this.http.post(`${this.apiUrl}/student-signup`, { username, email, password, confirmPassword }, { responseType: 'text' })
          .subscribe(response => {
            console.log('Sign-up successful', response);
            this.handleLoginAfterSignUp({ email, password });
          }, error => {
            console.error('Sign-up error', error);
          });
      }
    } else if (formType === 'signIn') {
      if (this.signinForm.valid) {
        const { email, password } = this.signinForm.value;

        // Call backend to authenticate user
        this.http.post(`${this.apiUrl}/student-signin`, { email, password }, { responseType: 'text' })
          .subscribe(response => {
            console.log('Sign-in successful', response);
            try {
              const parsedResponse = JSON.parse(response);
              if (parsedResponse && parsedResponse.user) {
                sessionStorage.setItem('loggedInUser', JSON.stringify(parsedResponse.user));
                this.router.navigate(['student-login/personal']);
              }
            } catch (e) {
              console.error('Error parsing response:', e);
            }
          }, error => {
            console.error('Sign-in error', error);
          });
      }
    }
  }

  // Automatically sign in after successful registration
  private handleLoginAfterSignUp(userData: any): void {
    const { email, password } = userData;

    this.http.post(`${this.apiUrl}/student-signin`, { email, password }, { responseType: 'text' })
      .subscribe(signinResponse => {
        console.log('Automatic sign-in successful', signinResponse);
        try {
          const parsedResponse = JSON.parse(signinResponse);
          if (parsedResponse && parsedResponse.user) {
            sessionStorage.setItem('loggedInUser', JSON.stringify(parsedResponse.user));
            this.router.navigate(['personal']);
          }
        } catch (e) {
          console.error('Error parsing automatic sign-in response:', e);
        }
      }, signinError => {
        console.error('Automatic sign-in error', signinError);
      });
  }
}
