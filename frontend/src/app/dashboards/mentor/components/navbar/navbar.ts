// Provides the common navigation for mentor pages

import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Auth } from '../../../../services/auth';

@Component({
  selector: 'app-mentor-navbar',
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

  // Logs out the mentor and redirects to login
  logout(): void {

    this.auth.logout();

    this.router.navigate(['/login']);

  }

}