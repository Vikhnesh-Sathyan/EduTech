// Provides the common navigation for student pages

import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Auth } from '../../../../services/auth';

@Component({
  selector: 'app-student-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  // Logs out the student and redirects to login
  logout(): void {

    this.auth.logout();

    this.router.navigate(['/login']);

  }

}