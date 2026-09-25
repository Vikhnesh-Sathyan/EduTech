import { Component } from '@angular/core';

import { Sidebar } from '../components/sidebar/sidebar';
import { Topbar } from '../components/topbar/topbar';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    Sidebar,
    Topbar
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard {

}