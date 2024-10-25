import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms'; // <-- Import this
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,HttpClientModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;  
  successMessage: string = '';  
  errorMessage: string = '';  

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    // Initialize the form with email field and validators
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])
    });
  }

  // Handle form submission
  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.value.email;

      // Make HTTP request to backend
      this.http.post('http://localhost:3000/api/forgot-password', { email })
        .subscribe(
          (response: any) => {
            this.successMessage = response.message;
            this.errorMessage = '';
          },
          (error) => {
            this.errorMessage = error.error.error || 'An error occurred. Please try again.';
            this.successMessage = '';
          }
        );
    }
  }

}