import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { MentorChatService } from
  '../../../services/chat/mentor-chat.service';

@Component({
  selector: 'app-mentor-inbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mentor-inbox.html',
  styleUrl: './mentor-inbox.css'
})
export class MentorInboxComponent implements OnInit, OnDestroy {

  // ==========================================
  // SIGNAL STATE
  // ==========================================

  conversations = signal<any[]>([]);
  loading = signal(true);
  errorMessage = signal('');
  searchText = signal('');

  // ==========================================
  // FILTER CONVERSATIONS USING COMPUTED
  // ==========================================

  filteredConversations = computed(() => {
    const query = this.searchText().trim().toLowerCase();
    const conversations = this.conversations();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) =>
      (conversation.student_name ?? '')
        .toLowerCase()
        .includes(query) ||
      (conversation.student_email ?? '')
        .toLowerCase()
        .includes(query)
    );
  });

  private subscriptions = new Subscription();

  constructor(
    private mentorChatService: MentorChatService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInbox();
  }

  // ==========================================
  // LOAD MENTOR INBOX
  // ==========================================

  loadInbox(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    console.log('[Mentor Inbox] Loading conversations...');

    this.subscriptions.add(
      this.mentorChatService.getInbox().subscribe({
        next: (response: any) => {
          console.log('[Mentor Inbox] API response:', response);

          const conversations = response?.conversations ?? [];

          this.conversations.set(conversations);

          console.log(
            '[Mentor Inbox] Conversations:',
            this.conversations()
          );

          this.loading.set(false);
        },

        error: (error) => {
          console.error('[Mentor Inbox] API error:', error);

          this.loading.set(false);

          this.errorMessage.set(
            error.error?.message ??
            'Unable to load your chat inbox.'
          );
        }
      })
    );
  }

  // ==========================================
  // OPEN SELECTED CONVERSATION
  // ==========================================

  openConversation(conversation: any): void {
    this.router.navigate([
      '/mentor/chat',
      conversation.conversation_id
    ]);
  }

  // ==========================================
  // LAST MESSAGE PREVIEW
  // ==========================================

  getLastMessage(conversation: any): string {
    return conversation.last_message || 'No messages yet';
  }

  // ==========================================
  // UNREAD MESSAGE COUNT
  // ==========================================

  getUnreadCount(conversation: any): number {
    return Number(conversation.unread_count || 0);
  }

  // ==========================================
  // CLEANUP
  // ==========================================

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
