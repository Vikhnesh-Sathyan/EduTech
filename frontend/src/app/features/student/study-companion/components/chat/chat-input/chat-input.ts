
import { Component, EventEmitter, Input, Output } from '@angular/core';
@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [],
  templateUrl: './chat-input.html',
  styleUrl: './chat-input.css',
})
export class ChatInput {

  question = '';

  @Output() sendQuestion = new EventEmitter<string>();

  @Input() isSending = false;

  onSend(): void {

    const trimmedQuestion = this.question.trim();

    if (!trimmedQuestion || this.isSending) {
      return;
    }

    this.sendQuestion.emit(trimmedQuestion);

    this.question = '';
  }

}
