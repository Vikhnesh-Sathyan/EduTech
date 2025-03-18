import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule,HttpClientModule,FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']  // Corrected to styleUrls
})
export class AdminComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router) {}

  onLogin(): void {
    // Hardcoded credentials for demonstration
    const adminUsername = 'admin';
    const adminPassword = 'password123';

    if (this.username === adminUsername && this.password === adminPassword) {
      // Store login status in local storage (or session) to remember the admin login
      localStorage.setItem('isAdminLoggedIn', 'true');
      // Redirect to the admin dashboard
      this.router.navigate(['admin-dashboard']);
    } else {
      this.errorMessage = 'Invalid username or password';
    }
  }
}
