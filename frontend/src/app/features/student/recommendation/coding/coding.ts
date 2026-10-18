
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';

import { Study as StudyService } from '../../../../services/student/study';
import { CodingService } from '../../../../services/student/coding';

import { Router } from '@angular/router';

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
  bookmarkingPostIds = signal<number[]>([]);

  // Voting state
  voteCounts = signal<any | null>(null);
  submittingVote = signal(false);

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
    private codingService: CodingService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

 ngOnInit(): void {
  this.loadSubjects();
  this.searchCodingQuestions();
  this.loadMyCodeBookmarks();

  this.route.queryParamMap.pipe(take(1)).subscribe(params => {
    const questionId = Number(params.get('questionId'));

    if (Number.isInteger(questionId) && questionId > 0) {
      this.openQuestion({ id: questionId });
    }
  });
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
  console.log('Selected question details:', response);
  console.log('Question ID:', response.id);
  console.log('Post ID:', response.post_id);

  this.selectedQuestion.set(response);
  this.loadCodePostVotes(Number(response.id ?? response.post_id));
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
  this.codingService.getMyCodeBookmarks().subscribe({
    next: (response: any) => {
      console.log('Bookmarks API response:', response);

      const bookmarks = response.bookmarks || [];

      this.bookmarkedPostIds.set(
        bookmarks.map((bookmark: any) => Number(bookmark.post_id))
      );

      console.log('Loaded bookmarked IDs:', this.bookmarkedPostIds());
    },
    error: (error: any) => {
      console.error('Failed to load bookmarks:', error);
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
      this.loadMyCodeBookmarks();
    },
    error: (error: any) => {
      console.error('Failed to update bookmark:', error);

      this.bookmarkingPostIds.update(ids =>
        ids.filter(bookmarkId => bookmarkId !== id)
      );
    }
  });
}
// Load vote counts for a coding question
loadCodePostVotes(postId: number): void {
  this.voteCounts.set(null);

  this.codingService.getCodePostVotes(postId).subscribe({
    next: (response: any) => {
      this.voteCounts.set(response);
    },
    error: (error: any) => {
      console.error('Failed to load coding question votes:', error);
      this.voteCounts.set(null);
    }
  });
}

// Submit or update my vote

voteOnCodePost(voteType: 'helpful' | 'not_helpful'): void {
  const postId = Number(
    this.selectedQuestion()?.id ?? this.selectedQuestion()?.post_id
  );

  if (
    !Number.isInteger(postId) ||
    postId <= 0 ||
    this.submittingVote()
  ) {
    return;
  }

  this.submittingVote.set(true);

  this.codingService.voteCodePost(postId, voteType).subscribe({
    next: () => {
      this.codingService.getCodePostVotes(postId).subscribe({
        next: (response: any) => {
          this.voteCounts.set(response);
          this.submittingVote.set(false);
        },
        error: (error: any) => {
          console.error('Failed to refresh coding question votes:', error);
          this.voteCounts.set(null);
          this.submittingVote.set(false);
        }
      });
    },
    error: (error: any) => {
      console.error('Failed to submit vote:', error);
      this.submittingVote.set(false);
    }
  });
}

openBookmarksPage(): void {
  this.router.navigate(['/student/recommendation/coding-bookmarks']);
}
}
