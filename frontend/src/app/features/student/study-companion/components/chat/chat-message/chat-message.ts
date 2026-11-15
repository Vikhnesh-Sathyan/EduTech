
import { Component, Input } from '@angular/core';

import { StudyChatMessage } from '../../../models/chat/study-chat.model';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [],
  templateUrl: './chat-message.html',
  styleUrl: './chat-message.css',
})
export class ChatMessage {

  @Input({ required: true })
  message!: StudyChatMessage;

  get isUserMessage(): boolean {
    return this.message.messageType === 'user';
  }

}
