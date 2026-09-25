// USE:
// Provides the shared navbar-only layout for admin management pages.
// The selected admin feature is displayed inside the router outlet.

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Navbar } from '../components/navbar/navbar';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    Navbar
  ],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout {

}