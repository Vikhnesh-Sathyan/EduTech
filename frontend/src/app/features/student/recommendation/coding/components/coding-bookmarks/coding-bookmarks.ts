import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { CodingService } from '../../../../../../services/student/coding';

@Component({
  selector: 'app-coding-bookmarks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coding-bookmarks.html',
  styleUrl: './coding-bookmarks.css',
})
export class CodingBookmarks implements OnInit {
  bookmarkedQuestions = signal<any[]>([]);
  loadingBookmarks = signal(false);
  bookmarksError = signal('');

  constructor(
    private codingService: CodingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMyCodeBookmarks();
  }

  loadMyCodeBookmarks(): void {
    this.loadingBookmarks.set(true);
    this.bookmarksError.set('');

    this.codingService.getMyCodeBookmarks().subscribe({
      next: (response: any) => {
        this.bookmarkedQuestions.set(response.bookmarks || []);
        this.loadingBookmarks.set(false);
      },
      error: (error: any) => {
        console.error('Failed to load bookmarks:', error);
        this.bookmarksError.set(
          error.error?.message || 'Unable to load your bookmarks.'
        );
        this.loadingBookmarks.set(false);
      },
    });
  }

  openQuestion(question: any): void {
    this.router.navigate(
      ['/student/recommendation/coding'],
      { queryParams: { questionId: question.post_id } }
    );
  }

  removeBookmark(question: any): void {
    this.codingService.removeCodeBookmark(Number(question.post_id)).subscribe({
      next: () => {
        this.bookmarkedQuestions.update(questions =>
          questions.filter(
            item => Number(item.post_id) !== Number(question.post_id)
          )
        );
      },
      error: (error: any) => {
        console.error('Failed to remove bookmark:', error);
        this.bookmarksError.set(
          error.error?.message || 'Unable to remove this bookmark.'
        );
      },
    });
  }

  goBackToCoding(): void {
    this.router.navigate(['/student/recommendation/coding']);
  }
}
