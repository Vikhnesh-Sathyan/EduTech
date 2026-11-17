
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  signal
} from '@angular/core';

import { StudyChatService } from '../../../services/chat/study-chat.service';

import { StudyChatMessage } from '../../../models/chat/study-chat.model';

import { ChatMessage } from '../chat-message/chat-message';
import { ChatInput } from '../chat-input/chat-input';

import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [
    ChatMessage,
    ChatInput
  ],
  templateUrl: './chat-panel.html',
  styleUrl: './chat-panel.css'
})
export class ChatPanel implements OnChanges {

  @Input({ required: true }) sessionUuid = '';

  // SIGNAL STATES
  messages = signal<StudyChatMessage[]>([]);

  isLoadingHistory = signal(false);
  isSending = signal(false);

  errorMessage = signal('');

  constructor(
    private studyChatService: StudyChatService,
    private toastService: ToastService
  ) {}

  // DETECT SESSION CHANGES
  ngOnChanges(changes: SimpleChanges): void {

    if (changes['sessionUuid'] && this.sessionUuid) {

      // Temporarily disabled for NG0100 investigation.
      // We will restore history loading after identifying the cause.

    }

  }

  // LOAD SAVED CHAT MESSAGES
  loadChatHistory(): void {

    if (!this.sessionUuid) {
      return;
    }

    this.isLoadingHistory.set(true);
    this.errorMessage.set('');

    this.studyChatService.getChatHistory(this.sessionUuid).subscribe({

      next: (response) => {

        this.messages.set(response.messages);
        this.isLoadingHistory.set(false);

      },

      error: (error) => {

        this.isLoadingHistory.set(false);

        this.errorMessage.set(
          error.error?.message || 'Unable to load chat history.'
        );

        this.toastService.error(this.errorMessage());

      }

    });

  }

  // SEND QUESTION TO AI
  sendQuestion(question: string): void {

    if (!question.trim() || this.isSending()) {
      return;
    }

    this.isSending.set(true);

    this.studyChatService.askQuestion(
      this.sessionUuid,
      question
    ).subscribe({

      next: () => {

        this.isSending.set(false);

        this.loadChatHistory();

      },

      error: (error) => {

        this.isSending.set(false);

        this.toastService.error(
          error.error?.message || 'Unable to get an answer.'
        );

        this.loadChatHistory();

      }

    });

  }

}
