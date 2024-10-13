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

  // Notification variables
  notificationMessage: string = '';
  notificationVisible: boolean = false;

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
        this.showNotification('Login failed: Invalid token received.');
      }
    } else {
      this.showNotification('Login failed: Invalid Google login response.');
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

  // Show notification
  private showNotification(message: string): void {
    this.notificationMessage = message;
    this.notificationVisible = true;
    setTimeout(() => {
      this.notificationVisible = false; // Hide after 3 seconds
    }, 3000);
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
            this.showNotification('Sign-up failed: ' + (error.message || 'Please try again later.'));
          });
      } else {
        this.showNotification('Please fill in all fields correctly.');
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
              this.showNotification('Sign-in failed: Unable to process response.');
            }
          }, error => {
            this.showNotification('Sign-in failed: ' + (error.message || 'Please check your credentials and try again.'));
          });
      } else {
        this.showNotification('Please fill in all fields correctly.');
      }
    } else {
      this.showNotification('Invalid form type');
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
              this.showNotification('Automatic sign-in failed: User data is missing.');
            }
          } catch (e) {
            this.showNotification('Automatic sign-in failed: Unable to process response.');
          }
        },
        error: (signinError) => {
          this.showNotification('Automatic sign-in failed: ' + (signinError.message || 'Please try again.'));
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
