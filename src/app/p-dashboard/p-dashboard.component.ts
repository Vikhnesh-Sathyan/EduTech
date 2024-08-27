import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-p-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './p-dashboard.component.html',
  styleUrl: './p-dashboard.component.css'
})
export class PDashboardComponent implements OnInit {
  ngOnInit(): void {
    // Any initialization logic if needed
  }

  // Removed dark mode related methods
  closeModal(): void {
    const modal = document.getElementById('myModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // Add any other methods you need here
}

