import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../../services/auth';
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  // Logs out the user and redirects to login
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}