import {
  Component,
  OnInit,
  OnDestroy,
  HostListener
} from '@angular/core';

import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';

import { Auth } from '../../../../services/auth';

import {
  DailyQuizNotificationService,
  DailyQuizNotification
} from '../../../../core/services/daily-quiz-notification.service';

import { ChatSocketService } from '../../../../services/chat/chat-socket.service';

@Component({
  selector: 'app-student-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, DatePipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy {

  notifications: DailyQuizNotification[] = [];

  unreadCount = 0;
  isDropdownOpen = false;

  private subscriptions = new Subscription();

  constructor(
    private auth: Auth,
    private router: Router,
    private notificationService: DailyQuizNotificationService,
    private chatSocket: ChatSocketService
  ) {}

  // ==========================================
  // INITIALIZE
  // ==========================================
ngOnInit(): void {

  // Load saved notifications
  this.loadNotifications();

  // Connect using the logged-in student's JWT
  const token = localStorage.getItem('token');

  if (token) {
    this.chatSocket.connect(token);
  }

  // Listen for live notifications
  this.listenForLiveNotifications();

}

  // ==========================================
  // LOAD NOTIFICATION HISTORY
  // ==========================================
  loadNotifications(): void {

    const subscription = this.notificationService
      .getNotifications()
      .subscribe({
        next: (response) => {
          this.notifications = response.data.notifications;
          this.unreadCount = response.data.unread_count;
        },
        error: (error) => {
          console.error('Failed to load notifications:', error);
        }
      });

    this.subscriptions.add(subscription);
  }

  // ==========================================
  // LISTEN FOR SOCKET NOTIFICATIONS
  // ==========================================
  listenForLiveNotifications(): void {

    const subscription = this.chatSocket.notifications$
      .subscribe((notification) => {

        const alreadyExists = this.notifications.some(
          item => item.id === notification.id
        );

        if (alreadyExists) {
          return;
        }

        this.notifications = [
          notification,
          ...this.notifications
        ];

        this.unreadCount++;

      });

    this.subscriptions.add(subscription);
  }

  // ==========================================
  // TOGGLE NOTIFICATION DROPDOWN
  // ==========================================
  toggleNotifications(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // ==========================================
  // MARK ONE NOTIFICATION AS READ
  // ==========================================
  markAsRead(notification: DailyQuizNotification): void {

    if (notification.is_read) {
      return;
    }

    const subscription = this.notificationService
      .markAsRead(notification.id)
      .subscribe({
        next: () => {

          notification.is_read = true;

          if (this.unreadCount > 0) {
            this.unreadCount--;
          }

        },
        error: (error) => {
          console.error('Failed to mark notification as read:', error);
        }
      });

    this.subscriptions.add(subscription);
  }

  // ==========================================
  // MARK ALL AS READ
  // ==========================================
  markAllAsRead(): void {

    if (this.unreadCount === 0) {
      return;
    }

    const subscription = this.notificationService
      .markAllAsRead()
      .subscribe({
        next: () => {

          this.notifications = this.notifications.map(notification => ({
            ...notification,
            is_read: true
          }));

          this.unreadCount = 0;

        },
        error: (error) => {
          console.error('Failed to mark all notifications as read:', error);
        }
      });

    this.subscriptions.add(subscription);
  }

  // ==========================================
  // LOGOUT
  // ==========================================
logout(): void {

  // Disconnect the existing Socket.IO connection
  this.chatSocket.disconnect();

  // Clear authentication data
  this.auth.logout();

  // Redirect to login
  this.router.navigate(['/login']);

}

  // ==========================================
  // CLEANUP
  // ==========================================
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ==========================================
// CLOSE DROPDOWN WHEN CLICKING OUTSIDE
// ==========================================
@HostListener('document:click')
closeNotificationsOnOutsideClick(): void {
  this.isDropdownOpen = false;
}

// ==========================================
// CLOSE DROPDOWN WITH ESCAPE KEY
// ==========================================
@HostListener('document:keydown.escape')
closeNotificationsOnEscape(): void {
  this.isDropdownOpen = false;
}
}
