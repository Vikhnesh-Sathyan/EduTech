import { Component, inject, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];
  private http = inject(HttpClient); // Inject HttpClient

  // Method to get notifications from API
  getNotifications() {
    this.http.get('http://localhost:3000/api/notifications').subscribe(
      (data: any) => {
        console.log('Received notifications:', data);
        this.notifications = data; // Ensure this matches your expected structure
      },
      error => {
        console.error('Error fetching notifications:', error);
      }
    );
  }
  unreadCount: number = 0;  // Store unread notification count

// Fetch unread notification count from the API
getUnreadNotificationsCount() {
  this.http.get('http://localhost:3000/api/notifications/unread-count').subscribe(
    (response: any) => {
      this.unreadCount = response.unreadCount;
    },
    (error) => {
      console.error('Error fetching unread notifications count', error);
    }
  );
}

  // Method to mark a notification as read
  markAsRead(notificationId: number) {
    this.http.put(`http://localhost:3000/api/notifications/${notificationId}`, {}).subscribe(
      response => {
        console.log('Notification marked as read:', response);
        // Update the local notification status
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.is_read = true; // Set the notification as read
        }
      },
      error => {
        console.error('Error marking notification as read:', error);
      }
    );
  }

  // OnInit lifecycle hook to fetch notifications when component is loaded
  ngOnInit() {
    this.getNotifications(); // Fetch notifications when the component loads
  }
  
}
