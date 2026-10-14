import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Study } from '../../../../../../services/student/study';
import {
  InterviewPrepFilters,
  InterviewPrepType,
  InterviewPrepDifficulty
} from '../../../../../../services/student/interview-prep.service';

@Component({
  selector: 'app-prep-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prep-filters.html',
  styleUrl: './prep-filters.css'
})
export class PrepFiltersComponent {
  private readonly studyService = inject(Study);

  filtersChanged = output<InterviewPrepFilters>();

  subjects = signal<{ id: number; name: string }[]>([]);
  loadingSubjects = signal(false);
  subjectError = signal('');

  search = signal('');
  prepType = signal<InterviewPrepType | ''>('');
  subjectId = signal<number | null>(null);
  difficulty = signal<InterviewPrepDifficulty | ''>('');
  sort = signal<'newest' | 'oldest'>('newest');

  readonly prepTypes: { value: InterviewPrepType; label: string }[] = [
    { value: 'technical_question', label: 'Technical Questions' },
    { value: 'coding_challenge', label: 'Coding Challenges' },
    { value: 'hr_question', label: 'HR Questions' },
    { value: 'interview_experience', label: 'Interview Experiences' },
    { value: 'preparation_tip', label: 'Preparation Tips' }
  ];

  constructor() {
    this.loadSubjects();
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
        console.error('Failed to load interview preparation subjects:', error);
        this.subjectError.set('Unable to load subjects.');
        this.loadingSubjects.set(false);
      }
    });
  }

  onSearchChange(value: string): void {
    this.search.set(value);
    this.emitFilters();
  }

  onPrepTypeChange(value: string): void {
    this.prepType.set(value as InterviewPrepType | '');
    this.emitFilters();
  }

  onSubjectChange(value: string): void {
    this.subjectId.set(value ? Number(value) : null);
    this.emitFilters();
  }

  onDifficultyChange(value: string): void {
    this.difficulty.set(value as InterviewPrepDifficulty | '');
    this.emitFilters();
  }

  onSortChange(value: string): void {
    this.sort.set(value as 'newest' | 'oldest');
    this.emitFilters();
  }

  clearFilters(): void {
    this.search.set('');
    this.prepType.set('');
    this.subjectId.set(null);
    this.difficulty.set('');
    this.sort.set('newest');
    this.emitFilters();
  }

  private emitFilters(): void {
    this.filtersChanged.emit({
      search: this.search(),
      prep_type: this.prepType(),
      subject_id: this.subjectId(),
      difficulty: this.difficulty(),
      sort: this.sort()
    });
  }
}