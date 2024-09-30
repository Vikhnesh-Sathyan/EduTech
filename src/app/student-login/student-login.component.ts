declare var google: any;

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

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
    this.initializeGoogleSignIn();
  }

  private initializeGoogleSignIn(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '768539892216-0qtcb4267ggt7hivd8r2vhva0vmnr85b.apps.googleusercontent.com',
        callback: (response: any) => {
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

  private handleGoogleLogin(response: any): void {
    if (response && response.credential) {
      const payload = this.decodeToken(response.credential);
      if (payload) {
        sessionStorage.setItem('loggedInUser', JSON.stringify(payload));
        this.router.navigate(['student-login/dashboard']);
      } else {
        console.error('Invalid token payload');
      }
    } else {
      console.error('Google login response is invalid');
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

  private initForms(): void {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15), this.noSpaces, this.startsWithSpecial, this.isValidCharacters, this.usernameTaken]],
      email: ['', [Validators.required, Validators.email, this.emailDomainValidator]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });

    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, this.emailDomainValidator]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  private emailDomainValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const email = control.value;
    const allowedDomains = ['example.com', 'edu', 'gmail.com'];
    if (email) {
      const domain = email.substring(email.lastIndexOf('@') + 1);
      return allowedDomains.includes(domain) ? null : { invalidDomain: true };
    }
    return null;
  }

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

  // Handle form submission based on form type (sign-up or sign-in)
onSubmit(event: Event, formType: 'signUp' | 'signIn'): void {
  event.preventDefault(); // Prevent the default form submission behavior

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
          // Optionally, you could handle the error response (e.g., show an error message)
        });
    } else {
      console.error('Sign-up form is invalid');
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
            // Handle JSON parsing errors if needed
          }
        }, error => {
          console.error('Sign-in error', error);
          // Optionally, handle the error response (e.g., show an error message)
        });
    } else {
      console.error('Sign-in form is invalid');
    }
  } else {
    console.error('Invalid form type');
  }
}

  private handleLoginAfterSignUp(userData: any): void {
    const { email, password } = userData;
    this.http.post(`${this.apiUrl}/student-signin`, { email, password }, { responseType: 'text' })
      .subscribe({
        next: (signinResponse) => {
          console.log('Automatic sign-in successful', signinResponse);
          try {
            const parsedResponse = JSON.parse(signinResponse);
            if (parsedResponse && parsedResponse.user) {
              sessionStorage.setItem('loggedInUser', JSON.stringify(parsedResponse.user));
              this.router.navigate(['personal']);
            } else {
              console.error('User data is missing in the response:', parsedResponse);
            }
          } catch (e) {
            console.error('Error parsing automatic sign-in response:', e);
          }
        },
        error: (signinError) => {
          console.error('Automatic sign-in error', signinError);
          alert('Automatic sign-in failed. Please try again.');
        }
      });
  }

  togglePanel(panel: string): void {
    const mainContainer = document.getElementById('main');
    if (panel === 'signUp') {
      mainContainer?.classList.add('right-panel-active');
    } else if (panel === 'signIn') {
      mainContainer?.classList.remove('right-panel-active');
    }
  }
}
