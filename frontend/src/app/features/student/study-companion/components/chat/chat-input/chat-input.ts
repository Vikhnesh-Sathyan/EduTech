
import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [],
  templateUrl: './chat-input.html',
  styleUrl: './chat-input.css',
})
export class ChatInput {

  // Stores the current question.
  question = signal('');

  // Receives the sending status from the parent.
  isSending = input(false);

  // Sends the question to the parent.
  sendQuestion = output<string>();

  onSend(): void {

    const trimmedQuestion = this.question().trim();

    if (!trimmedQuestion || this.isSending()) {
      return;
    }

    this.sendQuestion.emit(trimmedQuestion);

    this.question.set('');
  }

  onQuestionChange(value: string): void {
    this.question.set(value);
  }


onEnter(event: KeyboardEvent): void {

  if (event.shiftKey) {
    return;
  }

  event.preventDefault();

  this.onSend();
}


}
