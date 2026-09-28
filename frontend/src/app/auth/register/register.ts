// Handles user registration form and registration API call

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
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  message = '';
  errorMessage = '';

  registerForm;


  constructor(
    private fb: FormBuilder,
    private auth: Auth
  ) {

    this.registerForm = this.fb.group({

      name: [
        '',
        Validators.required
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8)
        ]
      ],

      confirmPassword: [
        '',
        Validators.required
      ],

      // Account type
      role: [
        'student',
        Validators.required
      ]

    });

  }


  onSubmit(): void {

    this.message = '';
    this.errorMessage = '';


    // Stop if form is invalid

    if (this.registerForm.invalid) {

      this.errorMessage =
        'Please enter all required details correctly.';

      return;

    }


    // Get values entered by the user

    const {
      name,
      email,
      password,
      confirmPassword,
      role
    } = this.registerForm.getRawValue();


    // Check password confirmation

    if (password !== confirmPassword) {

      this.errorMessage =
        'Passwords do not match.';

      return;

    }


    // Send registration data to backend

    this.auth.register({

      name: name!,
      email: email!,
      password: password!,
      role: role!

    }).subscribe({

      next: (response: any) => {

        this.message =
          response.message;

        this.registerForm.reset({
          role: 'student'
        });

      },


      error: (error) => {

        this.errorMessage =
          error.error?.message ||
          'Registration failed.';

      }

    });

  }

}