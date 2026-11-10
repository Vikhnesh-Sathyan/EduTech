
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { DebateService } from '../../../services/debate/debate.service';
import { StudentPosition } from '../../../models/debate/debate.model';

@Component({
  selector: 'app-debate-start',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './debate-start.html',
  styleUrl: './debate-start.css',
})
export class DebateStart {

  private debateService = inject(DebateService);
  private router = inject(Router);

  topic = '';
  studentPosition: StudentPosition = 'for';

  isLoading = false;
  errorMessage = '';

  startDebate(): void {

    const trimmedTopic = this.topic.trim();

    if (!trimmedTopic) {
      this.errorMessage = 'Please enter a debate topic.';
      return;
    }

    if (trimmedTopic.length > 300) {
      this.errorMessage = 'Topic cannot exceed 300 characters.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.debateService.createSession({
      topic: trimmedTopic,
      studentPosition: this.studentPosition
    }).subscribe({

      next: (response) => {

        this.isLoading = false;

        this.router.navigate([
          '/english-practice/debate/room',
          response.sessionId
        ]);

      },

      error: (error) => {

        this.isLoading = false;

        this.errorMessage =
          error.error?.message ||
          'Unable to start the debate. Please try again.';

      }

    });

  }

  goBack(): void {
    this.router.navigate(['/english-practice/debate']);
  }

}
