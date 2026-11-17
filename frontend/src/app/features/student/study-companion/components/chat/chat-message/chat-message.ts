
import { Component, computed, input } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';

import { StudyChatMessage } from '../../../models/chat/study-chat.model';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [MarkdownComponent],
  templateUrl: './chat-message.html',
  styleUrl: './chat-message.css',
})
export class ChatMessage {

  // Receives the message from the parent.
  message = input.required<StudyChatMessage>();

  // Checks whether the message belongs to the user.
  isUserMessage = computed(() =>
    this.message().messageType === 'user'
  );

}
