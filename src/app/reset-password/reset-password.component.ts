import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ForgotPasswordService } from '../forgot-password.service';  // Correct import path
import { ReactiveFormsModule } from '@angular/forms';  // Import this module
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,HttpClientModule],
  templateUrl: './reset-password.component.html',
  providers: [ForgotPasswordService],
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  email: string = '';  // Initialize email
  submitted: boolean = false;
  successMessage: string = '';  // Initialize success message
  errorMessage: string = '';  // Initialize error message

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private forgotPasswordService: ForgotPasswordService  // Inject the service
  ) {
    // Initialize the form with validation
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Get the email from the URL query parameter
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }

  // Handle form submission
  onSubmit() {
    this.submitted = true;

    // Validate form inputs
    if (this.resetPasswordForm.invalid) {
      return;
    }

    const { password, confirmPassword } = this.resetPasswordForm.value;

    if (password !== confirmPassword) {
      this.errorMessage = 'Passwords do not match!';
      return;
    }

    // Call the service to update the password
    this.forgotPasswordService.resetPassword(this.email, password).subscribe(
      (response: any) => {
        this.successMessage = 'Password reset successful!';
        setTimeout(() => this.router.navigate(['/login']), 3000);  // Redirect to login
      },
      (error: any) => {
        this.errorMessage = 'Password reset failed. Please try again.';
      }
    );
  }
}
