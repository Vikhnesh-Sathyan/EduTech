
import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommunityDoubtService } from '../../../../../../services/student/community-doubt.service';
import { Study } from '../../../../../../services/student/study';
interface Subject {
  id: number;
  name: string;
  description?: string;
}

@Component({
  selector: 'app-ask-doubt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ask-doubt.html',
  styleUrl: './ask-doubt.css'
})
export class AskDoubtComponent {
  private doubtService = inject(CommunityDoubtService);
private studyService = inject(Study);

  doubtSubmitted = output<void>();

  subjects = signal<Subject[]>([]);
  subjectId = signal<number | null>(null);
  title = signal('');
  question = signal('');

  loadingSubjects = signal(false);
  submitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor() {
    this.loadSubjects();
  }

loadSubjects(): void {
  this.loadingSubjects.set(true);
  this.errorMessage.set('');

  this.studyService.getSubjects().subscribe({
    next: (response: any) => {
      const subjects = Array.isArray(response)
        ? response
        : response?.subjects ?? response?.data ?? [];

      this.subjects.set(subjects);
      this.loadingSubjects.set(false);

      if (subjects.length === 0) {
        this.errorMessage.set('No subjects are available right now.');
      }
    },

    error: (error) => {
      console.error('Failed to load subjects for doubts:', error);

      this.errorMessage.set(
        'Unable to load subjects. Please try again.'
      );

      this.loadingSubjects.set(false);
    }
  });
}

  submitDoubt(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    const selectedSubjectId = this.subjectId();
    const trimmedTitle = this.title().trim();
    const trimmedQuestion = this.question().trim();

    if (!selectedSubjectId || !trimmedTitle || !trimmedQuestion) {
      this.errorMessage.set(
        'Please select a subject and complete both fields.'
      );
      return;
    }

    if (trimmedTitle.length > 200) {
      this.errorMessage.set('The title cannot exceed 200 characters.');
      return;
    }

    this.submitting.set(true);

    this.doubtService.createDoubt({
      subject_id: selectedSubjectId,
      title: trimmedTitle,
      question: trimmedQuestion
    }).subscribe({
      next: (response) => {
        this.successMessage.set(
          response.message || 'Doubt posted successfully!'
        );
        this.title.set('');
        this.question.set('');
        this.subjectId.set(null);
        this.submitting.set(false);
        this.doubtSubmitted.emit();
      },
      error: (error) => {
        console.error('Submit doubt error:', error);
        this.errorMessage.set(
          error.error?.message ||
          'Unable to post your doubt. Please try again.'
        );
        this.submitting.set(false);
      }
    });
  }
}
