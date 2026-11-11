
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';

// ==========================================
// NOTIFICATION TYPE
// ==========================================
export interface DailyQuizNotification {
  id: number;
  daily_quiz_id: number;
  user_id: number;
  notification_type: 'new_quiz' | 'reminder';
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatSocketService {

  private socket: Socket | null = null;
  private currentToken: string | null = null;

  // ==========================================
  // NOTIFICATION STREAM
  // ==========================================
  private notificationSubject =
    new Subject<DailyQuizNotification>();

  notifications$ = this.notificationSubject.asObservable();

  // ==========================================
  // CONNECT SOCKET
  // ==========================================
  connect(token: string): Socket {

    if (
      this.socket &&
      this.currentToken === token
    ) {
      if (!this.socket.connected) {
        this.socket.connect();
      }

      return this.socket;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.currentToken = token;

    this.socket = io('http://localhost:5000', {
      autoConnect: false,
      auth: { token }
    });

    // Listen for new notifications.
    this.socket.on(
      'notification:new',
      (notification: DailyQuizNotification) => {
        this.notificationSubject.next(notification);
      }
    );

    this.socket.connect();

    return this.socket;
  }

  // ==========================================
  // GET SOCKET
  // ==========================================
  getSocket(): Socket | null {
    return this.socket;
  }

  // ==========================================
  // DISCONNECT
  // ==========================================
  disconnect(): void {

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.currentToken = null;
  }
}
