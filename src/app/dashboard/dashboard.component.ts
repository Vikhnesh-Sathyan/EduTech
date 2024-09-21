import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Authservice } from '../authservice/authservice.component';

@Component({
  selector: 'app-dashboard',
  standalone: true, 
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);

  auth = inject(Authservice);
  name: string | undefined;
  userProfileImg: string | undefined;

  ngOnInit() {
    // Safely access sessionStorage data
    const userData = sessionStorage.getItem("loggedInUser");
    const   userProfileImg = sessionStorage.getItem("loggedInUser");


    if (userData) {
      const parsedData = JSON.parse(userData);
      this.name = parsedData.name;
      this.userProfileImg = parsedData.picture;
    } else {
      console.error("No user data found in sessionStorage.");
    }
  }

  // Sign-out function
  signOut() {
    this.auth.signOut();
  }
  Extracurriculm()
  {
    this.router.navigate(['student-login/extracurriculm']);
  }
  
}
