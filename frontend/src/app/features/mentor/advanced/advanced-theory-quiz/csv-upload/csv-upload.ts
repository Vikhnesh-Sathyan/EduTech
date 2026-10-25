
import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  AdvancedTheoryQuizService,
  TheoryQuizCsvPreview
} from '../../../../../services/mentor/advanced/advanced-theory-quiz.service';

import { EducationHierarchy } from './components/education-hierarchy/education-hierarchy';
import { QuizImportDetails } from './components/quiz-import-details/quiz-import-details';
import { CsvFileUpload } from './components/csv-file-upload/csv-file-upload';
import { CsvPreview } from './components/csv-preview/csv-preview';

type QuizDifficulty = 'beginner' | 'intermediate' | 'advanced';

interface QuizImportPayload {
  title: string;
  description: string;
  education_program_id: number;
  department_id: number;
  education_year_id: number;
  subject_id: number;
  topic_id: number;
  subtopic_id: number | null;
  difficulty: QuizDifficulty;
  pass_percentage: number;
}

@Component({
  selector: 'app-csv-upload',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    EducationHierarchy,
    QuizImportDetails,
    CsvFileUpload,
    CsvPreview
  ],
  templateUrl: './csv-upload.html',
  styleUrl: './csv-upload.css'
})
export class CsvUpload {
  readonly selectedFile = signal<File | null>(null);
  readonly preview = signal<TheoryQuizCsvPreview | null>(null);

  readonly errors = signal<string[]>([]);
  readonly message = signal('');

  readonly loading = signal(false);
  readonly importing = signal(false);

  readonly selectedProgramId = signal<number | null>(null);
  readonly selectedDepartmentId = signal<number | null>(null);
  readonly selectedEducationYearId = signal<number | null>(null);
  readonly selectedSubjectId = signal<number | null>(null);
  readonly selectedTopicId = signal<number | null>(null);
  readonly selectedSubtopicId = signal<number | null>(null);

  readonly quizTitle = signal('');
  readonly quizDescription = signal('');
  readonly difficulty = signal<QuizDifficulty>('beginner');
  readonly passPercentage = signal(60);

  readonly canImport = computed(() => {
    const percentage = this.passPercentage();

    return (
      this.selectedFile() !== null &&
      this.preview() !== null &&
      this.quizTitle().trim().length > 0 &&
      this.selectedProgramId() !== null &&
      this.selectedDepartmentId() !== null &&
      this.selectedEducationYearId() !== null &&
      this.selectedSubjectId() !== null &&
      this.selectedTopicId() !== null &&
      Number.isFinite(percentage) &&
      percentage >= 1 &&
      percentage <= 100 &&
      !this.loading() &&
      !this.importing()
    );
  });

  constructor(
    private readonly quizService: AdvancedTheoryQuizService
  ) {}

  private clearMessages(): void {
    this.errors.set([]);
    this.message.set('');
  }

  private getErrorMessages(
    error: any,
    fallbackMessage: string
  ): string[] {
    const responseErrors = error?.error?.errors;

    if (Array.isArray(responseErrors) && responseErrors.length > 0) {
      return responseErrors.map(String);
    }

    return [
      error?.error?.message || fallbackMessage
    ];
  }

  private resetQuizForm(): void {
    this.selectedFile.set(null);
    this.preview.set(null);

    this.quizTitle.set('');
    this.quizDescription.set('');
    this.difficulty.set('beginner');
    this.passPercentage.set(60);

    this.selectedTopicId.set(null);
    this.selectedSubtopicId.set(null);
  }

  handleFileSelection(file: File | null): void {
    this.clearMessages();
    this.preview.set(null);

    if (!file) {
      this.selectedFile.set(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.selectedFile.set(null);
      this.errors.set(['Please select a CSV file.']);
      return;
    }

    this.selectedFile.set(file);
  }

  previewCsv(): void {
    const file = this.selectedFile();

    if (!file || this.loading() || this.importing()) {
      return;
    }

    this.clearMessages();
    this.loading.set(true);
    this.preview.set(null);

    this.quizService.previewCsv(file).subscribe({
      next: response => {
        this.preview.set(response);
        this.message.set(
          response.message || 'CSV validated successfully.'
        );
        this.loading.set(false);
      },
      error: error => {
        this.errors.set(
          this.getErrorMessages(
            error,
            'Unable to validate the CSV file.'
          )
        );
        this.loading.set(false);
      }
    });
  }

  importQuiz(): void {
    if (!this.canImport()) {
      this.clearMessages();

      if (!this.selectedFile()) {
        this.errors.set(['Please select a CSV file first.']);
      } else if (!this.preview()) {
        this.errors.set([
          'Validate and preview the CSV before importing.'
        ]);
      } else if (!this.quizTitle().trim()) {
        this.errors.set(['Please enter a quiz title.']);
      } else if (this.selectedProgramId() === null) {
        this.errors.set(['Please select an education program.']);
      } else if (this.selectedDepartmentId() === null) {
        this.errors.set(['Please select a department.']);
      } else if (this.selectedEducationYearId() === null) {
        this.errors.set(['Please select an education year.']);
      } else if (this.selectedSubjectId() === null) {
        this.errors.set(['Please select a subject.']);
      } else if (this.selectedTopicId() === null) {
        this.errors.set(['Please select a topic.']);
      } else {
        this.errors.set([
          'Pass percentage must be between 1 and 100.'
        ]);
      }

      return;
    }

    if (this.loading() || this.importing()) {
      return;
    }

    this.clearMessages();

    const file = this.selectedFile();
    const programId = this.selectedProgramId();
    const departmentId = this.selectedDepartmentId();
    const educationYearId = this.selectedEducationYearId();
    const subjectId = this.selectedSubjectId();
    const topicId = this.selectedTopicId();

    if (
      !file ||
      programId === null ||
      departmentId === null ||
      educationYearId === null ||
      subjectId === null ||
      topicId === null
    ) {
      return;
    }

    console.log('Selected education IDs:', {
  programId,
  departmentId,
  educationYearId,
  subjectId,
  topicId,
  subtopicId: this.selectedSubtopicId()
});

    const quizDetails: QuizImportPayload = {
      title: this.quizTitle().trim(),
      description: this.quizDescription().trim(),
      education_program_id: programId,
      department_id: departmentId,
      education_year_id: educationYearId,
      subject_id: subjectId,
      topic_id: topicId,
      subtopic_id: this.selectedSubtopicId(),
      difficulty: this.difficulty(),
      pass_percentage: this.passPercentage()
    };

    this.importing.set(true);

    this.quizService.importCsv(file, quizDetails).subscribe({
      next: response => {
        this.resetQuizForm();

        this.message.set(
          response?.message ||
          'Quiz imported successfully as a draft.'
        );

        this.importing.set(false);
      },
      error: error => {
        this.errors.set(
          this.getErrorMessages(
            error,
            'Failed to import the quiz. Please check your details and try again.'
          )
        );

        this.importing.set(false);
      }
    });
  }
}
