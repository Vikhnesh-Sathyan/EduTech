import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Socket } from 'socket.io-client';

import { MentorChatService } from '../../../services/chat/mentor-chat.service';
import { ChatSocketService } from '../../../services/chat/chat-socket.service';

@Component({
  selector: 'app-mentor-chat',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './mentor-chat.html',
  styleUrl: './mentor-chat.css'
})
export class MentorChatComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mentorChatService = inject(MentorChatService);
  private readonly chatSocketService = inject(ChatSocketService);
  private readonly destroyRef = inject(DestroyRef);

  // ---- State (signals) ----
  readonly conversationId = signal<number | null>(null);
  readonly messages = signal<any[]>([]);
  readonly newMessage = signal('');

  readonly loading = signal(true);
  readonly sending = signal(false);
  readonly errorMessage = signal('');

  readonly currentUserId = signal(0);

  // Mentorship status controls whether new messages can be sent.
  readonly isActiveMentorship = signal(true);

  // ---- Derived state ----
  readonly canSend = computed(
    () => this.newMessage().trim().length > 0 && !this.sending()
  );

  readonly hasMessages = computed(() => this.messages().length > 0);

  readonly showConversation = computed(
    () =>
      !this.loading() &&
      !this.errorMessage() &&
      this.conversationId() !== null
  );

  private socket: Socket | null = null;

  isMyMessage(senderId: number | string): boolean {
    return Number(senderId) === this.currentUserId();
  }

  // ---- Socket handlers ----
  private readonly onNewMessage = (message: any) => {
    if (Number(message.conversation_id) !== this.conversationId()) {
      return;
    }

    const exists = this.messages().some(
      item => Number(item.id) === Number(message.id)
    );

    if (!exists) {
      this.messages.update(list => [...list, message]);
    }

    if (Number(message.sender_id) !== this.currentUserId()) {
      this.markMessagesAsRead();
    }
  };

  private readonly onMessagesRead = (event: any) => {
    if (Number(event.conversationId) !== this.conversationId()) {
      return;
    }

    const me = this.currentUserId();

    this.messages.update(list =>
      list.map(message =>
        Number(message.sender_id) === me
          ? { ...message, is_read: 1 }
          : message
      )
    );
  };

  ngOnInit(): void {
    this.currentUserId.set(this.getCurrentUserId());

    const id = Number(this.route.snapshot.paramMap.get('conversationId'));

    if (!Number.isSafeInteger(id) || id <= 0) {
      this.loading.set(false);
      this.errorMessage.set('Invalid conversation.');
      return;
    }

    this.conversationId.set(id);
    this.loadMessages();
  }

  loadMessages(): void {
    const id = this.conversationId();
    if (!id) return;

    this.loading.set(true);
    this.errorMessage.set('');

    this.mentorChatService
      .getMessages(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
         if (response?.conversation?.is_active_mentorship !== undefined) {
            this.isActiveMentorship.set(
            Number(response.conversation.is_active_mentorship) === 1
        );
  }

          // Support the existing response message format.
          this.messages.set(
            Array.isArray(response) ? response : response.messages ?? []
          );

          this.loading.set(false);

          this.connectSocket();
          this.markMessagesAsRead();
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(
            error.error?.message ?? 'Unable to load this conversation.'
          );
        }
      });
  }

  retry(): void {
    this.errorMessage.set('');
    this.loadMessages();
  }

connectSocket(): void {
  console.log('[Mentor Chat] connectSocket() called');

  const token = localStorage.getItem('token');
  const conversationId = this.conversationId();

  console.log('[Mentor Chat] Conversation ID:', conversationId);
  console.log('[Mentor Chat] Token exists:', !!token);

  if (!token || !conversationId) {
    console.error('[Mentor Chat] Missing token or conversation ID');
    this.errorMessage.set('Please sign in again to use chat.');
    return;
  }

  this.socket = this.chatSocketService.connect(token);

  console.log('[Mentor Chat] Socket instance created');

  this.socket.on('connect', () => {
    console.log('[Mentor Chat] Socket connected:', this.socket?.id);
  });

  this.socket.on('connect_error', (error) => {
    console.error('[Mentor Chat] Socket connection error:', error.message);
  });

  this.socket.on('disconnect', (reason) => {
    console.warn('[Mentor Chat] Socket disconnected:', reason);
  });

  this.socket.off('chat:new-message', this.onNewMessage);
  this.socket.off('chat:messages-read', this.onMessagesRead);

  this.socket.on('chat:new-message', (message: any) => {
    console.log('[Mentor Chat] New message received:', message);
    this.onNewMessage(message);
  });

  this.socket.on('chat:messages-read', this.onMessagesRead);

  this.socket.emit('chat:join', { conversationId }, (response: any) => {
    console.log('[Mentor Chat] Join response:', response);

    if (!response?.success) {
      this.errorMessage.set(
        response?.message ?? 'Unable to join this conversation.'
      );
    }
  });
}

  sendMessage(): void {
    // Prevent sending from the UI for historical conversations.
    if (!this.isActiveMentorship()) {
      this.errorMessage.set(
        'This conversation is read-only because the mentorship is no longer active.'
      );
      return;
    }

    const message = this.newMessage().trim();
    const conversationId = this.conversationId();

    if (
      !message ||
      !conversationId ||
      !this.socket?.connected ||
      this.sending()
    ) {
      return;
    }

    this.sending.set(true);
    this.errorMessage.set('');

    this.socket.emit(
      'chat:send',
      { conversationId, message },
      (response: any) => {
        this.sending.set(false);

        if (response?.success) {
          this.newMessage.set('');
        } else {
          this.errorMessage.set(response?.message ?? 'Unable to send message.');
        }
      }
    );
  }

  markMessagesAsRead(): void {
    const id = this.conversationId();
    if (!id) return;

    this.mentorChatService
      .markMessagesAsRead(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: () => {} });
  }

  getCurrentUserId(): number {
    try {
      const token = localStorage.getItem('token');

      if (!token) return 0;

      const payload = JSON.parse(atob(token.split('.')[1]));

      return Number(payload.id);
    } catch {
      return 0;
    }
  }

  goBack(): void {
    this.router.navigate(['/mentor-chat']);
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.off('chat:new-message', this.onNewMessage);
      this.socket.off('chat:messages-read', this.onMessagesRead);
    }
  }
}