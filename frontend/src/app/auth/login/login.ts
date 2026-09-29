// Handles the login form and login API call
import { Component } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  message = '';
  errorMessage = '';

  loginForm;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private router: Router

  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {


  console.log('LOGIN BUTTON CLICKED');

  this.message = '';
  this.errorMessage = '';
    this.message = '';
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }

    const { email, password } =
      this.loginForm.getRawValue();
console.log('CALLING LOGIN API');

    this.auth.login({
      email: email!,
      password: password!
    }).subscribe({
next: (response: any) => {
  console.log('LOGIN API SUCCESS', response);

  localStorage.setItem(
    'token',
    response.token
  );
// Store logged-in user information
  localStorage.setItem(
    'user',
    JSON.stringify(response.user)
  );

  if (response.user.role === 'student') {

    this.router.navigate(['/student-dashboard']);

  } else if (response.user.role === 'admin') {

    this.router.navigate(['/admin-dashboard']);

  } else if (response.user.role === 'mentor') {

    this.router.navigate(['/mentor-dashboard']);

  }

},

      error: (error) => {
          console.log('LOGIN API ERROR', error);

        this.errorMessage =
          error.error?.message || 'Login failed.';
      }
    });
  }
}