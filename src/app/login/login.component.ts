import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [AuthService]
})
export class LoginComponent {
  user = { email: '', password: '' };
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.user).subscribe(
      (response: any) => {
        console.log('Login successful:', response);

        // Save token and user details in localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('userRole', response.user.role);

        // Redirect based on role
        if (response.user.role === 'Student') {
          this.router.navigate(['/studentcollege']);
        } else if (response.user.role === 'Placement Officer') {
          this.router.navigate(['/placement']);
        } else if (response.user.role === 'Admin') {
          this.router.navigate(['/admin-dashboard']);
        }
      },
      (error) => {
        console.error('Login failed:', error);
        this.errorMessage = error.error.message || 'Login failed. Please try again.';
      }
    );
  }
  
  
}
