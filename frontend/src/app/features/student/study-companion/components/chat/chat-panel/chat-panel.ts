
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';

import { StudyChatService } from '../../../services/chat/study-chat.service';

import { StudyChatMessage } from '../../../models/chat/study-chat.model';

import { ChatMessage } from '../chat-message/chat-message';
import { ChatInput } from '../chat-input/chat-input';

import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [ChatMessage, ChatInput],
  templateUrl: './chat-panel.html',
  styleUrl: './chat-panel.css',
})
export class ChatPanel implements OnChanges {

  @Input({ required: true }) sessionUuid = '';

  messages: StudyChatMessage[] = [];

  isLoadingHistory = false;
  isSending = false;

  errorMessage = '';

  constructor(
    private studyChatService: StudyChatService,
    private toastService: ToastService
  ) {}

  // LOAD CHAT HISTORY WHEN SESSION CHANGES
  ngOnChanges(changes: SimpleChanges): void {

    if (changes['sessionUuid'] && this.sessionUuid) {
      this.loadChatHistory();
    }

  }

  // GET SAVED CHAT MESSAGES
  loadChatHistory(): void {

    this.isLoadingHistory = true;
    this.errorMessage = '';

    this.studyChatService.getChatHistory(this.sessionUuid).subscribe({

      next: (response) => {

        this.messages = response.messages;

        this.isLoadingHistory = false;

      },

      error: (error) => {

        this.isLoadingHistory = false;

        this.errorMessage =
          error.error?.message || 'Unable to load chat history.';

        this.toastService.error(this.errorMessage);

      }

    });

  }

  // SEND QUESTION TO AI
  sendQuestion(question: string): void {

    if (!question.trim() || this.isSending) {
      return;
    }

    this.isSending = true;

    this.studyChatService.askQuestion(
      this.sessionUuid,
      question
    ).subscribe({

      next: () => {

        this.isSending = false;

        // Reload messages with actual database IDs.
        this.loadChatHistory();

      },

      error: (error) => {

        this.isSending = false;

        this.toastService.error(
          error.error?.message || 'Unable to get an answer.'
        );

        // The backend may have saved the user question
        // before the AI request failed.
        this.loadChatHistory();

      }

    });

  }

}
