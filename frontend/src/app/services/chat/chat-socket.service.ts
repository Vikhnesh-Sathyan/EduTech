import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class ChatSocketService {
  private socket: Socket | null = null;
  private currentToken: string | null = null;

  // Connect using the logged-in user's JWT.
  connect(token: string): Socket {
    // Reuse only the connection belonging to this token.
    if (
      this.socket &&
      this.currentToken === token
    ) {
      if (!this.socket.connected) {
        this.socket.connect();
      }

      return this.socket;
    }

    // Disconnect a previous user's connection.
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.currentToken = token;

    this.socket = io('http://localhost:5000', {
      autoConnect: false,
      auth: { token }
    });

    this.socket.connect();

    return this.socket;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Disconnect when the user logs out.
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.currentToken = null;
  }
}