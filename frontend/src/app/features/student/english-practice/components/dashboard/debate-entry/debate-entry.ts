
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-debate-entry',
  standalone: true,
  imports: [],
  templateUrl: './debate-entry.html',
  styleUrl: './debate-entry.css',
})
export class DebateEntry {

  private router = inject(Router);

  startDebate(): void {
    this.router.navigate(['/english-practice/debate/start']);
  }

  viewHistory(): void {
    this.router.navigate(['/english-practice/debate/history']);
  }

}
