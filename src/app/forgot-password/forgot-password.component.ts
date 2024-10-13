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
  forgotPasswordForm!: FormGroup;  // Form group for forgot password

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    // Initialize the form group with email field and validators
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])  // Email validation
    });
  }

  // Function to handle forgot password form submission
 // Function to handle forgot password form submission
onSubmit() {
  if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.value.email;

      // Make HTTP request to send the forgot password email
      this.http.post('http://localhost:3000/api/forgot-password', { email })
          .subscribe(response => {
              console.log('Reset link sent successfully:', response);
              // Handle success, show message or navigate to another page
          }, error => {
              console.error('Error sending reset link:', error);
              // Handle error, show error message
          });
  }
}


  // Function to navigate to forgot password page (could be used elsewhere)
  forgotpassword() {
    this.router.navigate(['forgot-password']);
  }
}
