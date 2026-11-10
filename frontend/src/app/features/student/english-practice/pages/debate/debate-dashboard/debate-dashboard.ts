import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-debate-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './debate-dashboard.html',
  styleUrl: './debate-dashboard.css',
})
export class DebateDashboard {

  constructor(private router: Router) {}

  startDebate(): void {
    this.router.navigate(['/english-practice/debate/start']);
  }

  viewHistory(): void {
    this.router.navigate(['/english-practice/debate/history']);
  }

}