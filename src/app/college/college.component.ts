import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-college',
  standalone:true,
  imports:[FormsModule,CommonModule,HttpClientModule],
  templateUrl: './college.component.html',
  styleUrls: ['./college.component.css'],
  providers:[AuthService]
})
export class CollegeComponent {
  user = {
    name: '',
    email: '',
    password: '',
    role: '', // Student or Placement Officer
    studentId: '',
    classYear: '',
    department: '',
    parentName: '',
    contactNumber: '',
    employeeId: '',
    designation: '',
    experience: '',
    linkedinProfile: '',
  };

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    console.log(this.user);
  
    // Send user data to AuthService for registration
    this.authService.register(this.user).subscribe(
      (response) => {
        console.log('Registration Successful:', response);
        alert('Registration successful! Please wait for admin approval.');
        this.router.navigate(['/']); // Redirect to home/login page
      },
      (error) => {
        console.error('Registration failed:', error);
        alert('Registration failed. Please try again.');
      }
    );
  }
  

  formValid(): boolean {
    return (
      !!this.user.name &&
      !!this.user.email &&
      !!this.user.password &&
      !!this.user.role &&
      (this.user.role === 'Student'
        ? !!this.user.studentId && !!this.user.classYear && !!this.user.department
        : !!this.user.employeeId && !!this.user.designation && !!this.user.experience)
    );
  }
  
  navigateToLogin() {
    this.router.navigate(['/login']); // Adjust the route as necessary
  }
  navigateToplacementteam() {
    this.router.navigate(['placement-team']); // Adjust the route as necessary
  }
}
