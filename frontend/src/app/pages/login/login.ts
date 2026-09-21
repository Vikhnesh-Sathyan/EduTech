// Handles the login form and login API call

import { Component } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  message = '';
  errorMessage = '';

  loginForm;

  constructor(
    private fb: FormBuilder,
    private auth: Auth
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {

    this.message = '';
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }

    const { email, password } =
      this.loginForm.getRawValue();

    this.auth.login({
      email: email!,
      password: password!
    }).subscribe({
      next: (response: any) => {

        localStorage.setItem(
          'token',
          response.token
        );

        localStorage.setItem(
          'user',
          JSON.stringify(response.user)
        );

        this.message = response.message;
      },

      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Login failed.';
      }
    });
  }
}