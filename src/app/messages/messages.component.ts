import { Component } from '@angular/core';
import { MessagesService } from '../message.service'; // Adjust the path as necessary
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'], // Change 'styleUrl' to 'styleUrls'
  providers: [MessagesService]
})
export class MessagesComponent {
  messageContent: string = '';
  recipient: string = 'student';  // Replace with actual student ID
  sender: string = 'teacher';      // Replace with actual teacher ID

  constructor(private messagesService: MessagesService) {}
  sendMessage() {
    if (!this.messageContent.trim()) {
        console.error('Message content cannot be empty.');
        return;
    }

    this.messagesService.sendMessage(this.sender, this.recipient, this.messageContent).subscribe(
        (response: any) => {
            console.log('Message sent:', response);
            this.messageContent = ''; // Clear the input field
        },
        (error: any) => {
            console.error('Failed to send message:', error);
        }
    );
}

}
