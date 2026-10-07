
// Controls application-wide toast notifications

import {
  Injectable,
  signal
} from '@angular/core';

export type ToastType =
  | 'success'
  | 'error'
  | 'info';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  // Stores the current toast message
  message = signal('');

  // Stores the toast type
  type = signal<ToastType>('info');

  // Controls toast visibility
  visible = signal(false);

  // Shows a toast notification
  show(
    message: string,
    type: ToastType = 'info',
    duration: number = 3000
  ): void {

    this.message.set(message);
    this.type.set(type);
    this.visible.set(true);

    setTimeout(() => {
      this.hide();
    }, duration);
  }

  // Shows a success toast
  success(message: string): void {
    this.show(message, 'success');
  }

  // Shows an error toast
  error(message: string): void {
    this.show(message, 'error');
  }

  // Shows an informational toast
  info(message: string): void {
    this.show(message, 'info');
  }

  // Hides the toast
  hide(): void {
    this.visible.set(false);
  }
}
