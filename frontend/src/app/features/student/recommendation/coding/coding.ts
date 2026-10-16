
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Study as StudyService } from '../../../../services/student/study';
import { CodingService } from '../../../../services/student/coding';

import { CodingSearchComponent } from './components/coding-search/coding-search';
import { CodingQuestionListComponent } from './components/coding-question-list/coding-question-list';
import { CodingQuestionFormComponent } from './components/coding-question-form/coding-question-form';

@Component({
  selector: 'app-coding',
  standalone: true,
  imports: [
    CommonModule,
    CodingSearchComponent,
    CodingQuestionListComponent,
    CodingQuestionFormComponent
  ],
  templateUrl: './coding.html',
  styleUrl: './coding.css'
})
export class CodingComponent implements OnInit {

  subjects = signal<any[]>([]);
  codePosts = signal<any[]>([]);

  selectedQuestion = signal<any | null>(null);

  codeSolutions = signal<any[]>([]);

  loadingSubjects = signal(true);
  loadingPosts = signal(false);

  showQuestionForm = signal(false);

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


createCodeQuestion(question: {
  title: string;
  subject_id: number;
  problem_statement: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  search_keywords: string;
  code: string;
}): void {
  this.postsError.set('');

  const { code, ...questionData } = question;

  this.codingService.createCodePost(questionData).subscribe({
    next: (response: any) => {
      const postId =
        response.postId ??
        response.post?.id ??
        response.question?.id ??
        response.id;

      if (!postId) {
        this.postsError.set(
          'Question was created, but its ID was not returned. The code solution was not saved.'
        );
        this.searchCodingQuestions();
        return;
      }

      this.codingService.createCodeSolution(postId, {
        solution_title: 'Initial Code Solution',
        programming_language: 'Not specified',
        code,
        algorithm_explanation: '',
        time_complexity: '',
        space_complexity: ''
      }).subscribe({
        next: () => {
          this.closeQuestionForm();
          this.searchText = '';
          this.selectedSubjectId = '';
          this.searchCodingQuestions();
        },
        error: (error: any) => {
          console.error('Failed to save code solution:', error);
          this.postsError.set(
            error.error?.message ||
            'Question was created, but saving its code solution failed.'
          );
          this.searchCodingQuestions();
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
  this.selectedQuestion.set(post);
  this.codeSolutions.set([]);
  this.postsError.set('');

  this.codingService.getCodeSolutions(Number(post.id)).subscribe({
    next: (response: any) => {
      this.codeSolutions.set(response.solutions || []);
    },
    error: (error: any) => {
      console.error('Failed to load code solutions:', error);
      this.postsError.set(
        error.error?.message || 'Failed to load code solutions.'
      );
    }
  });
}


}
