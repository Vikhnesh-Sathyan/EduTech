import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'; // <-- Import HttpClientModule

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule,HttpClientModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  email: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    const payload = { email: this.email };

    this.http.post('/api/forgot-password', payload).subscribe(
      (response: any) => {
        alert('Password reset link sent!');
        this.router.navigate(['/login']);
      },
      (error) => {
        alert('An error occurred. Please try again.');
      }
    );
  }
}
