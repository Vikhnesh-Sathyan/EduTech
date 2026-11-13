import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ChangeDetectorRef
} from '@angular/core';

import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';

import { Auth } from '../../../../services/auth';

import {
  StudentDailyQuizNotificationService,
  StudentDailyQuizNotification
} from '../../../../services/student/daily-quiz/student-daily-quiz-notification.service';

import { ChatSocketService } from '../../../../services/chat/chat-socket.service';

@Component({
  selector: 'app-student-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, DatePipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy {

  notifications: StudentDailyQuizNotification[] = [];

  unreadCount = 0;
  isDropdownOpen = false;

  private subscriptions = new Subscription();

  constructor(
  private auth: Auth,
  private router: Router,
  private notificationService: StudentDailyQuizNotificationService,
  private chatSocket: ChatSocketService,
  private cdr: ChangeDetectorRef
) {}

  // ==========================================
  // INITIALIZE
  // ==========================================

  ngOnInit(): void {

    this.loadNotifications();

    this.loadUnreadCount();

    const token = localStorage.getItem('token');

    if (token) {
      this.chatSocket.connect(token);
    }

    this.listenForLiveNotifications();
  }

  // ==========================================
  // LOAD NOTIFICATION HISTORY
  // ==========================================

  loadNotifications(): void {

    const subscription = this.notificationService
      .getNotifications(1)
      .subscribe({
        next: (response) => {
          this.notifications = response.notifications;
        },
        error: (error) => {
          console.error('Failed to load notifications:', error);
        }
      });

    this.subscriptions.add(subscription);
  }

  // ==========================================
  // LOAD UNREAD COUNT
  // ==========================================

 loadUnreadCount(): void {

  const subscription = this.notificationService
    .getUnreadCount()
    .subscribe({
      next: (response) => {

        this.unreadCount = Number(response.unread_count);

        this.cdr.markForCheck();

      },
      error: (error) => {
        console.error('Failed to load unread count:', error);
      }
    });

  this.subscriptions.add(subscription);
}

  // ==========================================
  // LISTEN FOR LIVE NOTIFICATIONS
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

        const newNotification: StudentDailyQuizNotification = {
          id: notification.id,
          daily_quiz_id: notification.daily_quiz_id,
          notification_type: notification.notification_type,
          title: notification.title,
          message: notification.message,
          is_read: false,
          read_at: null,
          created_at: notification.created_at
        };

        this.notifications = [
          newNotification,
          ...this.notifications
        ].slice(0, 10);

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

  markAsRead(notification: StudentDailyQuizNotification): void {

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
  // MARK ALL NOTIFICATIONS AS READ
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

    this.chatSocket.disconnect();

    this.auth.logout();

    this.router.navigate(['/login']);
  }

  // ==========================================
  // CLEANUP
  // ==========================================

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ==========================================
  // CLOSE DROPDOWN ON OUTSIDE CLICK
  // ==========================================

  @HostListener('document:click')
  closeNotificationsOnOutsideClick(): void {
    this.isDropdownOpen = false;
  }

  // ==========================================
  // CLOSE DROPDOWN WITH ESCAPE
  // ==========================================

  @HostListener('document:keydown.escape')
  closeNotificationsOnEscape(): void {
    this.isDropdownOpen = false;
  }

}
