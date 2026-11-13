
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// =====================================================
// NOTIFICATION INTERFACES
// =====================================================

export interface StudentDailyQuizNotification {
  id: number;
  daily_quiz_id: number;
  notification_type: 'new_quiz' | 'reminder';
  title: string;
  message: string;
  is_read: boolean | number;
  read_at: string | null;
  created_at: string;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface StudentNotificationsResponse {
  success: boolean;
  notifications: StudentDailyQuizNotification[];
  pagination: NotificationPagination;
}

export interface UnreadNotificationCountResponse {
  success: boolean;
  unread_count: number;
}

export interface NotificationActionResponse {
  success: boolean;
  message: string;
}

// =====================================================
// NOTIFICATION SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class StudentDailyQuizNotificationService {

  private apiUrl = 'http://localhost:5000/api/student/daily-quiz/notifications';

  constructor(private http: HttpClient) {}

  // GET NOTIFICATIONS
  getNotifications(page: number = 1): Observable<StudentNotificationsResponse> {
    return this.http.get<StudentNotificationsResponse>(
      `${this.apiUrl}?page=${page}`
    );
  }

  // GET UNREAD COUNT
  getUnreadCount(): Observable<UnreadNotificationCountResponse> {
    return this.http.get<UnreadNotificationCountResponse>(
      `${this.apiUrl}/unread-count`
    );
  }

  // MARK ONE AS READ
  markAsRead(notificationId: number): Observable<NotificationActionResponse> {
    return this.http.patch<NotificationActionResponse>(
      `${this.apiUrl}/${notificationId}/read`,
      {}
    );
  }

  // MARK ALL AS READ
  markAllAsRead(): Observable<NotificationActionResponse> {
    return this.http.patch<NotificationActionResponse>(
      `${this.apiUrl}/read-all`,
      {}
    );
  }
}
