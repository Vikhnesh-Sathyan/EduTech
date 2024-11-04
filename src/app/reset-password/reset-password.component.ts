import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ForgotPasswordService } from '../forgot-password.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './reset-password.component.html',
  providers: [ForgotPasswordService],
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  email: string = '';
  submitted: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private forgotPasswordService: ForgotPasswordService
  ) {
    // Initialize the form with validation
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  ngOnInit() {
    // Get email from the query parameter in the URL
    this.route.queryParams.subscribe((params) => {
      this.email = params['email'] || '';
    });
  }

  // Handle form submission
  onSubmit() {
    this.submitted = true;

    // Check if the form is valid
    if (this.resetPasswordForm.invalid) {
      return;
    }

    const { password, confirmPassword } = this.resetPasswordForm.value;

    // Check if the passwords match
    if (password !== confirmPassword) {
      this.errorMessage = 'Passwords do not match!';
      return;
    }

    // Call service to reset the password
    this.forgotPasswordService.resetPassword(this.email, password).subscribe(
      (response: any) => {
        // Successful response
        this.successMessage = 'Password reset successful!';
        setTimeout(() => this.router.navigate(['/parent-login']), 3000); // Redirect after 3 seconds
      },
      (error: any) => {
        // Handle error response
        this.errorMessage = 'Password reset failed. Please try again.';
      }
    );
  }
}
