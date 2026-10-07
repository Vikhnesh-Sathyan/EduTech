
// Displays application-wide toast notifications

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css'
})
export class Toast {

  constructor(
    public toastService: ToastService
  ) {}

  // Closes the toast manually
  close(): void {
    this.toastService.hide();
  }
}
