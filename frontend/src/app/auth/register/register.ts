// Handles the student registration form and registration API call

import { Component } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';
import { Auth } from '../../services/auth';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  message = ''; //store message for user like success 
  errorMessage = '';

  registerForm;

  constructor(
    private fb: FormBuilder,
    private auth: Auth
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit() {

    this.message = '';
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      this.errorMessage = 'Please enter all required details correctly.';
      return;
    }
      //get the values enter by the user
    const { name, email, password, confirmPassword } =
      this.registerForm.getRawValue();

    if (password !== confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    //call auth service
    this.auth.register({
      name: name!,
      email: email!,
      password: password!
    }).subscribe({
      next: (response: any) => {
        this.message = response.message;
        this.registerForm.reset();
      },

      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Registration failed.';
      }
    });
  }
}