import {
  Component,
  inject,
  input,
  output,
  signal,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Study } from '../../../../../../services/student/study';

import {
  InterviewPrepService,
  InterviewPrep,
  InterviewPrepPayload,
  InterviewPrepType,
  InterviewPrepDifficulty
} from '../../../../../../services/student/interview-prep.service';

@Component({
  selector: 'app-prep-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prep-form.html',
  styleUrl: './prep-form.css'
})
export class PrepFormComponent implements OnInit {
  private readonly prepService = inject(InterviewPrepService);
  private readonly studyService = inject(Study);

  // Optional post ID enables editing an existing post later.
  postId = input<number | null>(null);

  postSaved = output<void>();
  cancelled = output<void>();

  subjects = signal<{ id: number; name: string }[]>([]);
  loadingSubjects = signal(false);
  subjectError = signal('');

  submitting = signal(false);
  loadingPost = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  title = signal('');
  description = signal('');
  prepType = signal<InterviewPrepType>('technical_question');
  subjectId = signal<number | null>(null);
  difficulty = signal<InterviewPrepDifficulty>('beginner');
  content = signal('');

  readonly prepTypes: {
    value: InterviewPrepType;
    label: string;
  }[] = [
    { value: 'technical_question', label: 'Technical Question' },
    { value: 'coding_challenge', label: 'Coding Challenge' },
    { value: 'hr_question', label: 'HR Question' },
    { value: 'interview_experience', label: 'Interview Experience' },
    { value: 'preparation_tip', label: 'Preparation Tip' }
  ];

  readonly difficulties: {
    value: InterviewPrepDifficulty;
    label: string;
  }[] = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  ngOnInit(): void {
    this.loadSubjects();

    const id = this.postId();

    if (id !== null) {
      this.loadPostForEditing(id);
    }
  }

  loadSubjects(): void {
    this.loadingSubjects.set(true);
    this.subjectError.set('');

    this.studyService.getSubjects().subscribe({
      next: (response: any) => {
        const subjects = Array.isArray(response)
          ? response
          : response?.subjects ?? response?.data ?? [];

        this.subjects.set(subjects);
        this.loadingSubjects.set(false);
      },
      error: (error) => {
        console.error('Error loading subjects:', error);
        this.subjectError.set('Unable to load subjects.');
        this.loadingSubjects.set(false);
      }
    });
  }

  loadPostForEditing(id: number): void {
    this.loadingPost.set(true);
    this.errorMessage.set('');

    this.prepService.getById(id).subscribe({
      next: (post: InterviewPrep) => {
        this.title.set(post.title ?? '');
        this.description.set(post.description ?? '');
        this.prepType.set(post.prep_type);
        this.subjectId.set(post.subject_id ?? null);
        this.difficulty.set(post.difficulty ?? 'beginner');
        this.content.set(post.content ?? '');
        this.loadingPost.set(false);
      },
      error: (error) => {
        console.error('Error loading preparation post:', error);
        this.errorMessage.set('Unable to load this preparation post.');
        this.loadingPost.set(false);
      }
    });
  }

  onTitleChange(value: string): void {
    this.title.set(value);
  }

  onDescriptionChange(value: string): void {
    this.description.set(value);
  }

  onTypeChange(value: string): void {
    this.prepType.set(value as InterviewPrepType);
  }

  onSubjectChange(value: string): void {
    this.subjectId.set(value ? Number(value) : null);
  }

  onDifficultyChange(value: string): void {
    this.difficulty.set(value as InterviewPrepDifficulty);
  }

  onContentChange(value: string): void {
    this.content.set(value);
  }

  submitForm(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    const title = this.title().trim();
    const description = this.description().trim();
    const content = this.content().trim();

    if (!title) {
      this.errorMessage.set('Please enter a title.');
      return;
    }

    if (title.length > 200) {
      this.errorMessage.set('The title cannot exceed 200 characters.');
      return;
    }

    if (!content) {
      this.errorMessage.set('Please enter the preparation content.');
      return;
    }

    if (this.submitting()) {
      return;
    }

    const payload: InterviewPrepPayload = {
      title,
      description,
      content,
      prep_type: this.prepType(),
      subject_id: this.subjectId(),
      difficulty: this.difficulty()
    };

    this.submitting.set(true);

    const id = this.postId();

    const request$ = id !== null
      ? this.prepService.update(id, payload)
      : this.prepService.create(payload);

    request$.subscribe({
      next: () => {
        this.successMessage.set(
          id !== null
            ? 'Preparation post updated successfully!'
            : 'Preparation post shared successfully!'
        );

        this.submitting.set(false);
        this.postSaved.emit();
      },
      error: (error) => {
        console.error('Error saving preparation post:', error);

        this.errorMessage.set(
          error?.error?.message ||
          'Unable to save your preparation post. Please try again.'
        );

        this.submitting.set(false);
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
