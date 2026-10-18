
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Study as StudyService } from '../../../../services/student/study';
import { CodingService } from '../../../../services/student/coding';

import { CodingSearchComponent } from './components/coding-search/coding-search';
import { CodingQuestionListComponent } from './components/coding-question-list/coding-question-list';
import { CodingQuestionFormComponent } from './components/coding-question-form/coding-question-form';
import { CodeHighlightComponent } from './components/code-highlight/code-highlight';
import { CodeAlgorithmComponent } from './components/code-algorithm/code-algorithm';
import { CodeFlowchart } from './components/code-flowchart/code-flowchart';
import { CodeAnimationComponent } from './components/code-animation/code-animation';

@Component({
  selector: 'app-coding',
  standalone: true,
  imports: [
    CommonModule,
    CodingSearchComponent,
    CodingQuestionListComponent,
    CodingQuestionFormComponent,
    CodeHighlightComponent,
    CodeAlgorithmComponent,
    CodeFlowchart,  
    CodeAnimationComponent
  ],
  templateUrl: './coding.html',
  styleUrl: './coding.css'
})
export class CodingComponent implements OnInit {
 subjects = signal<any[]>([]);
 codePosts = signal<any[]>([]);
 selectedQuestion = signal<any | null>(null);

  // Bookmark state
  bookmarkedPostIds = signal<number[]>([]);
  loadingBookmarks = signal(false);
  bookmarkingPostIds = signal<number[]>([]);

  loadingSubjects = signal(true);
  loadingPosts = signal(false);
  loadingQuestion = signal(false);
  showQuestionForm = signal(false);

  showFlowchartFor = signal<number | null>(null);

  // Track the active learning tab for each solution
activeLearningTab = signal<Record<number, string>>({});

  subjectError = signal('');
  postsError = signal('');

  searchText = '';
  selectedSubjectId = '';

  constructor(
    private studyService: StudyService,
    private codingService: CodingService
  ) {}

 ngOnInit(): void {
  this.loadSubjects();
  this.searchCodingQuestions();
  this.loadMyCodeBookmarks();
}

  loadSubjects(): void {
    this.studyService.getSubjects().subscribe({
      next: (response: any) => {
        this.subjects.set(response.subjects || []);
        this.loadingSubjects.set(false);
      },
      error: (error: any) => {
        console.error('Failed to load coding subjects:', error);
        this.subjectError.set(
          error.error?.message || 'Failed to load subjects.'
        );
        this.loadingSubjects.set(false);
      }
    });
  }

  searchCodingQuestions(): void {
    this.loadingPosts.set(true);
    this.postsError.set('');

    this.codingService
      .getCodePosts(this.searchText, this.selectedSubjectId)
      .subscribe({
        next: (response: any) => {
          const posts = Array.isArray(response)
            ? response
            : response.questions || response.posts || [];

          this.codePosts.set(posts);
          this.loadingPosts.set(false);
        },
        error: (error: any) => {
          console.error('Failed to load coding questions:', error);
          this.postsError.set(
            error.error?.message || 'Failed to load coding questions.'
          );
          this.loadingPosts.set(false);
        }
      });
  }

  openQuestionForm(): void {
    this.showQuestionForm.set(true);
  }

  closeQuestionForm(): void {
    this.showQuestionForm.set(false);
  }

  closeSelectedQuestion(): void {
    this.selectedQuestion.set(null);
    this.showFlowchartFor.set(null);
    this.postsError.set('');
  }

  toggleFlowchart(solutionId: number | string): void {
    const id = Number(solutionId);

    this.showFlowchartFor.update(current =>
      current === id ? null : id
    );
  }

  isFlowchartOpen(solutionId: number | string): boolean {
    return this.showFlowchartFor() === Number(solutionId);
  }

  createCodeQuestion(question: {
    title: string;
    subject_id: number;
    problem_statement: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    search_keywords: string;
    code: string;
  }): void {
    const { code, ...questionData } = question;

    this.codingService.createCodePost(questionData).subscribe({
      next: (response: any) => {
        const postId = Number(
          response.id ??
          response.postId ??
          response.post?.id ??
          response.question?.id
        );

        if (!Number.isInteger(postId) || postId <= 0) {
          this.postsError.set(
            'Question created, but its ID was not returned.'
          );
          return;
        }

        const selectedSubject = this.subjects().find(
          subject => Number(subject.id) === question.subject_id
        );

        this.codingService.createCodeSolution(postId, {
          solution_title: 'Original Code',
          programming_language: selectedSubject?.name || 'Unknown',
          code,
          algorithm_explanation: '',
          time_complexity: '',
          space_complexity: ''
        }).subscribe({
          next: () => {
            this.showQuestionForm.set(false);
            this.postsError.set('');
            this.searchCodingQuestions();
          },
          error: (error: any) => {
            console.error('Failed to save original code:', error);
            this.postsError.set(
              'Question created, but saving its code failed.'
            );
          }
        });
      },
      error: (error: any) => {
        console.error('Failed to create coding question:', error);
        this.postsError.set(
          error.error?.message || 'Failed to create coding question.'
        );
      }
    });
  }


openQuestion(post: any): void {
  this.selectedQuestion.set(null);
  this.showFlowchartFor.set(null);
  this.activeLearningTab.set({});
  this.loadingQuestion.set(true);
  this.postsError.set('');

  this.codingService.getCodePostById(Number(post.id)).subscribe({
    next: (response: any) => {
      this.selectedQuestion.set(response);
      this.loadingQuestion.set(false);
    },
    error: (error: any) => {
      console.error('Failed to load coding question details:', error);
      this.postsError.set(
        error.error?.message || 'Failed to load question details.'
      );
      this.loadingQuestion.set(false);
    }
  });
}

setLearningTab(
  solutionId: number | string,
  tab: string
): void {
  this.activeLearningTab.update(current => ({
    ...current,
    [Number(solutionId)]: tab
  }));
}

getLearningTab(solutionId: number | string): string {
  return this.activeLearningTab()[Number(solutionId)] || 'code';
}

// Load my bookmarked coding questions
loadMyCodeBookmarks(): void {
  this.loadingBookmarks.set(true);

  this.codingService.getMyCodeBookmarks().subscribe({
  next: (response: any) => {
  console.log('Bookmarks API response:', response);

  const bookmarks = response.bookmarks || [];

  this.bookmarkedPostIds.set(
    bookmarks.map((bookmark: any) => Number(bookmark.post_id))
  );

  console.log('Loaded bookmarked IDs:', this.bookmarkedPostIds());

  this.loadingBookmarks.set(false);
},
    error: (error: any) => {
      console.error('Failed to load bookmarks:', error);
      this.loadingBookmarks.set(false);
    }
  });
}

// Check whether a question is bookmarked
isBookmarked(postId: number | string): boolean {
  return this.bookmarkedPostIds().includes(Number(postId));
}

// Add or remove a bookmark
toggleBookmark(postId: number | string): void {
  const id = Number(postId);

  if (!Number.isInteger(id) || id <= 0) {
    return;
  }

  if (this.bookmarkingPostIds().includes(id)) {
    return;
  }

  this.bookmarkingPostIds.update(ids => [...ids, id]);

  const request = this.isBookmarked(id)
    ? this.codingService.removeCodeBookmark(id)
    : this.codingService.bookmarkCodePost(id);

  request.subscribe({
    next: () => {
      this.bookmarkedPostIds.update(ids =>
        ids.includes(id)
          ? ids.filter(bookmarkId => bookmarkId !== id)
          : [...ids, id]
      );

      this.bookmarkingPostIds.update(ids =>
        ids.filter(bookmarkId => bookmarkId !== id)
      );
    },
    error: (error: any) => {
      console.error('Failed to update bookmark:', error);

      this.bookmarkingPostIds.update(ids =>
        ids.filter(bookmarkId => bookmarkId !== id)
      );
    }
  });
}
}
