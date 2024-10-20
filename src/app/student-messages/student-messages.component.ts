// student-messages.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MessagesService } from '../message.service';

@Component({
  selector: 'app-student-messages',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './student-messages.component.html',
  styleUrls: ['./student-messages.component.css'],
  providers: [MessagesService],
})
export class StudentMessagesComponent implements OnInit {
  messages: any[] = [];  // Store messages for the student
  studentId: string = 'student';  // Replace with actual student ID

  constructor(private messagesService: MessagesService) {}

  ngOnInit() {
    this.loadMessages();  // Load messages when the component initializes
  }

  loadMessages() {
    console.log('Fetching messages for student:', this.studentId);  // Log student ID
  
    this.messagesService.getMessagesForStudent(this.studentId).subscribe(
      (response: any) => {
        console.log('Response from API:', response);  // Log the response
        this.messages = response;
      },
      (error: any) => {
        console.error('Failed to load messages:', error);
      }
    );
  }
  
  
}
