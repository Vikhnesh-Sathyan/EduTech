
import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  AdvancedTheoryQuizService,
  TheoryQuizCsvPreview
} from '../../../../services/mentor/advanced/advanced-theory-quiz.service';

import { AdminEducationProgram } from '../../../../services/admin/admin-education-program';
import { AdminDepartment } from '../../../../services/admin/admin-department';
import { AdminEducationYear } from '../../../../services/admin/admin-education-year';
import { AdminSubject } from '../../../../services/admin/admin-subjects';
import { AdminTopic } from '../../../../services/admin/admin-topic';
import { AdminSubtopic } from '../../../../services/admin/admin-subtopic';

// ======================================================
// TYPES
// ======================================================

interface EducationProgram {
  id: number;
  name: string;
  description: string | null;
  status: 'active' | 'inactive';
}

interface Department {
  id: number;
  name: string;
  education_program_id: number;
  status?: string;
}

interface EducationYear {
  id: number;
  name: string;
  department_id: number;
  year_order: number;
  status?: string;
}

interface Subject {
  id: number;
  name: string;
  education_year_id: number;
  status?: string;
}

interface Topic {
  id: number;
  name: string;
  subject_id: number;
  status?: string;
}

interface Subtopic {
  id: number;
  topic_id: number;
  title: string;
  description?: string;
  display_order?: number;
  status?: string;
}

type QuizDifficulty = 'beginner' | 'intermediate' | 'advanced';

interface QuizImportDetails {
  title: string;
  description: string;
  topic_id: number;
  subtopic_id: number | null;
  difficulty: QuizDifficulty;
  pass_percentage: number;
}

// ======================================================
// COMPONENT
// ======================================================

@Component({
  selector: 'app-csv-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './csv-upload.html',
  styleUrl: './csv-upload.css'
})
export class CsvUpload implements OnInit {

  // ----------------------------------------------------
  // CSV FILE AND PREVIEW STATE
  // ----------------------------------------------------

  readonly selectedFile = signal<File | null>(null);
  readonly preview = signal<TheoryQuizCsvPreview | null>(null);

  readonly errors = signal<string[]>([]);
  readonly message = signal('');

  readonly loading = signal(false);
  readonly importing = signal(false);

  // ----------------------------------------------------
  // EDUCATION PROGRAM STATE
  // ----------------------------------------------------

  readonly programs = signal<EducationProgram[]>([]);
  readonly selectedProgramId = signal<number | null>(null);

  // ----------------------------------------------------
  // DEPARTMENT STATE
  // ----------------------------------------------------

  readonly departments = signal<Department[]>([]);
  readonly selectedDepartmentId = signal<number | null>(null);
  readonly loadingDepartments = signal(false);

  // ----------------------------------------------------
  // EDUCATION YEAR STATE
  // ----------------------------------------------------

  readonly educationYears = signal<EducationYear[]>([]);
  readonly selectedEducationYearId = signal<number | null>(null);
  readonly loadingEducationYears = signal(false);

  // ----------------------------------------------------
  // SUBJECT STATE
  // ----------------------------------------------------

  readonly subjects = signal<Subject[]>([]);
  readonly selectedSubjectId = signal<number | null>(null);
  readonly loadingSubjects = signal(false);

  // ----------------------------------------------------
  // TOPIC STATE
  // ----------------------------------------------------

  readonly topics = signal<Topic[]>([]);
  readonly selectedTopicId = signal<number | null>(null);
  readonly loadingTopics = signal(false);

  // ----------------------------------------------------
  // SUBTOPIC STATE
  // ----------------------------------------------------

  readonly subtopics = signal<Subtopic[]>([]);
  readonly selectedSubtopicId = signal<number | null>(null);
  readonly loadingSubtopics = signal(false);

  // ----------------------------------------------------
  // QUIZ DETAILS STATE
  // ----------------------------------------------------

  readonly quizTitle = signal('');
  readonly quizDescription = signal('');

  readonly difficulty = signal<QuizDifficulty>('beginner');
  readonly passPercentage = signal(60);

  // ----------------------------------------------------
  // COMPUTED STATE
  // ----------------------------------------------------

  // A CSV file and a completed preview are required before import.
  readonly canImport = computed(() => {
    return (
      this.selectedFile() !== null &&
      this.preview() !== null &&
      this.quizTitle().trim().length > 0 &&
      this.selectedTopicId() !== null &&
      this.passPercentage() >= 1 &&
      this.passPercentage() <= 100 &&
      !this.loading() &&
      !this.importing()
    );
  });

  // ----------------------------------------------------
  // SERVICES
  // ----------------------------------------------------

  constructor(
    private quizService: AdvancedTheoryQuizService,
    private programService: AdminEducationProgram,
    private departmentService: AdminDepartment,
    private educationYearService: AdminEducationYear,
    private subjectService: AdminSubject,
    private topicService: AdminTopic,
    private subtopicService: AdminSubtopic
  ) {}

  // ======================================================
  // INITIALIZATION
  // ======================================================

  ngOnInit(): void {
    this.loadPrograms();
  }

  // ======================================================
  // COMMON HELPERS
  // ======================================================

  /**
   * Supports API responses that return either an array
   * directly or an array inside the expected response key.
   *
   * The response key must match the actual backend response.
   */
  private extractList<T>(response: unknown, key: string): T[] {
    if (Array.isArray(response)) {
      return response as T[];
    }

    if (
      response !== null &&
      typeof response === 'object' &&
      key in response
    ) {
      const value = (response as Record<string, unknown>)[key];

      return Array.isArray(value) ? value as T[] : [];
    }

    return [];
  }

  /**
   * Clears messages before starting a new operation.
   */
  private clearMessages(): void {
    this.errors.set([]);
    this.message.set('');
  }

  /**
   * Keeps only active records when the API supplies a status.
   */
  private activeRecords<T extends { status?: string }>(records: T[]): T[] {
    return records.filter(
      record => !record.status || record.status === 'active'
    );
  }

  // ======================================================
  // EDUCATION PROGRAMS
  // ======================================================

  loadPrograms(): void {
  this.programService.getProgramsForMentor().subscribe({
    next: (response: any) => {
      const programs = this.extractList<EducationProgram>(
        response,
        'programs'
      );

      this.programs.set(this.activeRecords(programs));
    },
    error: () => {
      this.errors.set(['Failed to load education programs.']);
    }
  });
}

  // ======================================================
  // EDUCATION HIERARCHY RESET HELPERS
  // ======================================================

  /**
   * Changing a program invalidates every child selection.
   */
  private clearDepartmentsAndChildren(): void {
    this.departments.set([]);
    this.selectedDepartmentId.set(null);
    this.loadingDepartments.set(false);

    this.clearYearsAndChildren();
  }

  private clearYearsAndChildren(): void {
    this.educationYears.set([]);
    this.selectedEducationYearId.set(null);
    this.loadingEducationYears.set(false);

    this.clearSubjectsAndChildren();
  }

  private clearSubjectsAndChildren(): void {
    this.subjects.set([]);
    this.selectedSubjectId.set(null);
    this.loadingSubjects.set(false);

    this.clearTopicsAndChildren();
  }

  private clearTopicsAndChildren(): void {
    this.topics.set([]);
    this.selectedTopicId.set(null);
    this.loadingTopics.set(false);

    this.clearSubtopics();
  }

  private clearSubtopics(): void {
    this.subtopics.set([]);
    this.selectedSubtopicId.set(null);
    this.loadingSubtopics.set(false);
  }

  // ======================================================
  // DEPARTMENTS
  // ======================================================

onProgramChange(programId: number | null): void {
  this.clearMessages();
  this.clearDepartmentsAndChildren();

  if (programId === null) {
    return;
  }

  this.loadingDepartments.set(true);

  this.departmentService
    .getDepartmentsByProgramForMentor(programId)
    .subscribe({
      next: (response: any) => {
        const departments = this.extractList<Department>(
          response,
          'departments'
        );

        this.departments.set(this.activeRecords(departments));
        this.loadingDepartments.set(false);
      },
      error: (error) => {
        console.error('Failed to load departments:', error);
        this.errors.set(['Failed to load departments.']);
        this.loadingDepartments.set(false);
      }
    });
}


  // ======================================================
  // EDUCATION YEARS
  // ======================================================

  onDepartmentChange(departmentId: number | null): void {
    console.log('Selected department ID:', departmentId);
    this.clearMessages();
    this.clearYearsAndChildren();

    if (departmentId === null) {
      return;
    }

    this.loadingEducationYears.set(true);

    this.educationYearService
      .getEducationYearsByDepartmentForMentor(departmentId)
      .subscribe({
      next: (response: any) => {
  console.log('Selected department ID:', departmentId);
  console.log('Education years response:', response);

  const years = this.extractList<EducationYear>(
    response,
    'years'
  );

  console.log('Parsed education years:', years);

  this.educationYears.set(this.activeRecords(years));
  this.loadingEducationYears.set(false);
},
        error: () => {
          this.errors.set(['Failed to load education years.']);
          this.loadingEducationYears.set(false);
        }
      });
  }

  // ======================================================
  // SUBJECTS
  // ======================================================

onEducationYearChange(yearId: number | null): void {
  this.clearMessages();
  this.clearSubjectsAndChildren();

  if (yearId === null) {
    return;
  }

  this.loadingSubjects.set(true);

  console.log('Selected year ID:', yearId);

  this.subjectService.getSubjectsByYearForMentor(yearId).subscribe({
    next: (response: any) => {
      console.log('Subjects API response:', response);

      const subjects = this.extractList<Subject>(
        response,
        'subjects'
      );

      const activeSubjects = this.activeRecords(subjects);

      console.log('Parsed subjects:', subjects);
      console.log('Active subjects:', activeSubjects);

      this.subjects.set(activeSubjects);
      this.loadingSubjects.set(false);
    },

    error: (error) => {
      console.error('Failed to load subjects:', error);
      console.error('Subject API status:', error.status);
      console.error('Subject API error:', error.error);

      this.errors.set(['Failed to load subjects.']);
      this.loadingSubjects.set(false);
    }
  });
}


  // ======================================================
  // TOPICS
  // ======================================================

  onSubjectChange(subjectId: number | null): void {
    this.clearMessages();
    this.clearTopicsAndChildren();

    if (subjectId === null) {
      return;
    }

    this.loadingTopics.set(true);

    this.topicService.getTopicsBySubjectForMentor(subjectId).subscribe({
      next: (response: any) => {
        const topics = this.extractList<Topic>(
          response,
          'topics'
        );

        this.topics.set(this.activeRecords(topics));
        this.loadingTopics.set(false);
      },
      error: () => {
        this.errors.set(['Failed to load topics.']);
        this.loadingTopics.set(false);
      }
    });
  }

  // ======================================================
  // SUBTOPICS
  // ======================================================

  onTopicChange(topicId: number | null): void {
  this.clearMessages();
  this.clearSubtopics();

  if (topicId === null) {
    return;
  }

  this.loadingSubtopics.set(true);

  console.log('Selected topic ID:', topicId);

  this.subtopicService.getSubtopicsForMentor(topicId).subscribe({
    next: (response: any) => {
      console.log('Subtopics API response:', response);

      const subtopics = this.extractList<Subtopic>(
        response,
        'subtopics'
      );

      console.log('Parsed subtopics:', subtopics);

      const activeSubtopics = this.activeRecords(subtopics);
      console.log('Active subtopics:', activeSubtopics);

      this.subtopics.set(activeSubtopics);
      this.loadingSubtopics.set(false);
    },
    error: (error) => {
      console.error('Failed to load subtopics:', error);
      console.error('Status:', error.status);
      console.error('Error response:', error.error);

      this.errors.set(['Failed to load subtopics.']);
      this.loadingSubtopics.set(false);
    }
  });
}

  // ======================================================
  // CSV FILE SELECTION
  // ======================================================

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.clearMessages();
    this.preview.set(null);

    if (!file) {
      this.selectedFile.set(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.selectedFile.set(null);
      this.errors.set(['Please select a CSV file.']);
      input.value = '';
      return;
    }

    this.selectedFile.set(file);
  }

  // ======================================================
  // CSV VALIDATION AND PREVIEW
  // ======================================================

  previewCsv(): void {
    const file = this.selectedFile();

    if (!file || this.loading() || this.importing()) {
      return;
    }

    this.loading.set(true);
    this.preview.set(null);
    this.clearMessages();

    this.quizService.previewCsv(file).subscribe({
      next: (response) => {
        this.preview.set(response);
        this.message.set(response.message || 'CSV validated successfully.');
        this.loading.set(false);
      },
      error: (error) => {
        const responseErrors = error?.error?.errors;

        this.errors.set(
          Array.isArray(responseErrors)
            ? responseErrors
            : [
                error?.error?.message ??
                'Unable to validate the CSV file.'
              ]
        );

        this.loading.set(false);
      }
    });
  }

  // ======================================================
  // IMPORT QUIZ AS DRAFT
  // ======================================================

  importQuiz(): void {
    this.clearMessages();

    const file = this.selectedFile();
    const title = this.quizTitle().trim();
    const topicId = this.selectedTopicId();
    const passPercentage = this.passPercentage();

    if (!file) {
      this.errors.set(['Please select a CSV file first.']);
      return;
    }

    if (!this.preview()) {
      this.errors.set(['Validate and preview the CSV before importing.']);
      return;
    }

    if (!title) {
      this.errors.set(['Please enter a quiz title.']);
      return;
    }

    if (topicId === null) {
      this.errors.set(['Please select a topic.']);
      return;
    }

    if (
      !Number.isFinite(passPercentage) ||
      passPercentage < 1 ||
      passPercentage > 100
    ) {
      this.errors.set([
        'Pass percentage must be between 1 and 100.'
      ]);
      return;
    }

    if (this.loading() || this.importing()) {
      return;
    }

    const quizDetails: QuizImportDetails = {
      title,
      description: this.quizDescription().trim(),
      topic_id: topicId,
      subtopic_id: this.selectedSubtopicId(),
      difficulty: this.difficulty(),
      pass_percentage: passPercentage
    };

    this.importing.set(true);

    this.quizService.importCsv(file, quizDetails).subscribe({
      next: (response: any) => {
        this.message.set(
          response?.message ||
          'Quiz imported successfully as a draft.'
        );

        // Clear the uploaded file and preview after successful import.
        this.selectedFile.set(null);
        this.preview.set(null);

        // Reset quiz details for the next import.
        this.quizTitle.set('');
        this.quizDescription.set('');
        this.difficulty.set('beginner');
        this.passPercentage.set(60);

        // Reset the file input visually in the template by using
        // the selectedFile signal to control its surrounding UI.
        this.importing.set(false);
      },
      error: (error) => {
        this.errors.set([
          error?.error?.message ||
          'Failed to import the quiz. Please check your details and try again.'
        ]);

        this.importing.set(false);
      }
    });
  }
}
