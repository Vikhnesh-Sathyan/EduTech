import {
  Component,
  OnDestroy,
  OnInit,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Socket } from 'socket.io-client';

import { StudentChatService } from
  '../../../services/chat/student-chat.service';

import { ChatSocketService } from
  '../../../services/chat/chat-socket.service';

@Component({
  selector: 'app-student-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-chat.html',
  styleUrl: './student-chat.css'
})
export class StudentChatComponent implements OnInit, OnDestroy {
  // Reactive state
  readonly conversationId = signal<number | null>(null);
  readonly messages = signal<any[]>([]);
  readonly newMessage = signal('');
  readonly loading = signal(true);
  readonly sending = signal(false);
  readonly errorMessage = signal('');
  readonly isActiveMentorship = signal(true);
  readonly currentUserId = signal(0);

  readonly canSendMessage = computed(() =>
    this.isActiveMentorship() &&
    this.newMessage().trim().length > 0 &&
    !this.sending()
  );

  private socket: Socket | null = null;
  private subscriptions = new Subscription();

  private readonly onNewMessage = (message: any) => {
    if (
      Number(message.conversation_id) !==
      this.conversationId()
    ) {
      return;
    }

    const exists = this.messages().some(
      item => Number(item.id) === Number(message.id)
    );

    if (!exists) {
      this.messages.update(current => [...current, message]);
    }

    if (
      Number(message.sender_id) !== this.currentUserId()
    ) {
      this.markMessagesAsRead();
    }
  };

  private readonly onMessagesRead = (event: any) => {
    if (
      Number(event.conversationId) !== this.conversationId()
    ) {
      return;
    }

    this.messages.update(current =>
      current.map(message =>
        Number(message.sender_id) === this.currentUserId()
          ? { ...message, is_read: 1 }
          : message
      )
    );
  };

  constructor(
    private studentChatService: StudentChatService,
    private chatSocketService: ChatSocketService
  ) {}

  ngOnInit(): void {
    this.currentUserId.set(this.getCurrentUserId());
    this.loadConversation();
  }

  // Load the student's conversation.
  loadConversation(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.subscriptions.add(
      this.studentChatService.getMyConversation().subscribe({
        next: (response: any) => {
          const conversation = response?.conversation ?? response;

          const id = Number(
            conversation?.id ?? conversation?.conversation_id
          );

          if (!Number.isSafeInteger(id) || id <= 0) {
            this.loading.set(false);
            this.errorMessage.set(
              'No mentor conversation was found.'
            );
            return;
          }

          this.conversationId.set(id);
          this.loadMessages();
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(
            error.error?.message ??
            'Unable to load your mentor conversation.'
          );
        }
      })
    );
  }

  // Load history and mentorship status.
  loadMessages(): void {
    const id = this.conversationId();

    if (!id) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.subscriptions.add(
      this.studentChatService.getMessages(id).subscribe({
        next: (response: any) => {
          this.isActiveMentorship.set(
            Number(
              response?.conversation?.is_active_mentorship
            ) === 1
          );

          this.messages.set(
            Array.isArray(response)
              ? response
              : response?.messages ?? []
          );

          this.loading.set(false);
          this.connectSocket();
          this.markMessagesAsRead();
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(
            error.error?.message ??
            'Unable to load chat messages.'
          );
        }
      })
    );
  }

  // Connect to Socket.IO and join the conversation.
  connectSocket(): void {
    const token = localStorage.getItem('token');
    const id = this.conversationId();

    if (!token || !id) {
      this.errorMessage.set(
        'Please sign in again to use chat.'
      );
      return;
    }

    this.socket = this.chatSocketService.connect(token);

    // Remove this component's previous handlers before registering.
    this.socket.off('chat:new-message', this.onNewMessage);
    this.socket.off('chat:messages-read', this.onMessagesRead);

    this.socket.on('chat:new-message', this.onNewMessage);
    this.socket.on('chat:messages-read', this.onMessagesRead);

    this.socket.emit(
      'chat:join',
      { conversationId: id },
      (response: any) => {
        if (!response?.success) {
          this.errorMessage.set(
            response?.message ?? 'Unable to join chat.'
          );
        }
      }
    );
  }

  // Send only while the mentorship is active.
  sendMessage(): void {
    if (!this.isActiveMentorship()) {
      this.errorMessage.set(
        'This conversation is read-only because the mentorship is no longer active.'
      );
      return;
    }

    const message = this.newMessage().trim();
    const id = this.conversationId();

    if (
      !message ||
      !id ||
      !this.socket?.connected ||
      this.sending()
    ) {
      return;
    }

    this.sending.set(true);
    this.errorMessage.set('');

    this.socket.emit(
      'chat:send',
      {
        conversationId: id,
        message
      },
      (response: any) => {
        this.sending.set(false);

        if (response?.success) {
          this.newMessage.set('');
          return;
        }

        const error = response?.message ??
          'Unable to send message.';

        this.errorMessage.set(error);

        if (error.toLowerCase().includes('read-only')) {
          this.isActiveMentorship.set(false);
        }
      }
    );
  }

  // Mark received messages as read using the existing HTTP API.
  markMessagesAsRead(): void {
    const id = this.conversationId();

    if (!id) return;

    this.subscriptions.add(
      this.studentChatService.markMessagesAsRead(id).subscribe({
        error: () => {
          // Keep chat usable if the read receipt request fails.
        }
      })
    );
  }

  // Decode the user ID for display only.
  // The backend remains responsible for authentication.
  getCurrentUserId(): number {
    try {
      const token = localStorage.getItem('token');

      if (!token) return 0;

      const payload = JSON.parse(
        atob(token.split('.')[1])
      );

      return Number(payload.id) || 0;
    } catch {
      return 0;
    }
  }

  isMyMessage(senderId: number | string): boolean {
    return Number(senderId) === this.currentUserId();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();

    if (this.socket) {
      this.socket.off('chat:new-message', this.onNewMessage);
      this.socket.off('chat:messages-read', this.onMessagesRead);
    }
  }
}