
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:5000/api/student/daily-quizzes';

export interface DailyQuizNotification {
  id: number;
  daily_quiz_id: number;
  notification_type: 'new_quiz' | 'reminder';
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  data: {
    notifications: DailyQuizNotification[];
    unread_count: number;
    pagination: {
      current_page: number;
      limit: number;
      total_notifications: number;
      total_pages: number;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class DailyQuizNotificationService {

  private apiUrl = `${API_URL}/notifications`;

  constructor(private http: HttpClient) {}

  // ==========================================
  // GET NOTIFICATIONS
  // ==========================================
  getNotifications(page: number = 1): Observable<NotificationResponse> {

    const params = new HttpParams()
      .set('page', page);

    return this.http.get<NotificationResponse>(
      this.apiUrl,
      { params }
    );
  }

  // ==========================================
  // MARK ONE AS READ
  // ==========================================
  markAsRead(notificationId: number): Observable<any> {

    return this.http.patch(
      `${this.apiUrl}/${notificationId}/read`,
      {}
    );
  }

  // ==========================================
  // MARK ALL AS READ
  // ==========================================
  markAllAsRead(): Observable<any> {

    return this.http.patch(
      `${this.apiUrl}/read-all`,
      {}
    );
  }
}
