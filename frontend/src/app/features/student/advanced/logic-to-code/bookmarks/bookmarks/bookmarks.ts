
import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import {
  ProblemBookmarkService,
  BookmarkedProblem
} from '../../../../../../services/student/advanced/logic-to-code/problem-bookmark.service';

import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './bookmarks.html',
  styleUrl: './bookmarks.css'
})
export class Bookmarks implements OnInit {

  private bookmarkService = inject(ProblemBookmarkService);
  private toast = inject(ToastService);

  // =====================================================
  // COMPONENT STATE
  // =====================================================

  bookmarks = signal<BookmarkedProblem[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  removingBookmarkId = signal<number | null>(null);

  // =====================================================
  // INITIALIZE COMPONENT
  // =====================================================

  ngOnInit(): void {
    this.loadBookmarks();
  }

  // =====================================================
  // LOAD BOOKMARKED PROBLEMS
  // =====================================================

  loadBookmarks(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.bookmarkService.getBookmarkedProblems().subscribe({

      next: (response) => {

        this.bookmarks.set(response.data || []);
        this.loading.set(false);

      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message ||
          'Failed to load bookmarked problems.'
        );

        this.loading.set(false);

      }

    });

  }

  // =====================================================
  // REMOVE BOOKMARK
  // =====================================================

  removeBookmark(problem: BookmarkedProblem): void {

    if (this.removingBookmarkId() !== null) {
      return;
    }

    this.removingBookmarkId.set(problem.id);

    this.bookmarkService
      .removeProblemBookmark(problem.id)
      .subscribe({

        next: (response) => {

          this.bookmarks.update(items =>
            items.filter(item => item.id !== problem.id)
          );

          this.toast.success(
            response.message || 'Bookmark removed successfully.'
          );

          this.removingBookmarkId.set(null);

        },

        error: (error) => {

          this.toast.error(
            error.error?.message || 'Failed to remove bookmark.'
          );

          this.removingBookmarkId.set(null);

        }

      });

  }

}
