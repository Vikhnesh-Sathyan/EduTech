import { CommonModule } from '@angular/common';
import { Component, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AdminEducationProgram } from '../../../../../../../services/admin/admin-education-program';
import { AdminDepartment } from '../../../../../../../services/admin/admin-department';
import { AdminEducationYear } from '../../../../../../../services/admin/admin-education-year';
import { AdminSubject } from '../../../../../../../services/admin/admin-subjects';
import { AdminTopic } from '../../../../../../../services/admin/admin-topic';
import { AdminSubtopic } from '../../../../../../../services/admin/admin-subtopic';

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

@Component({
  selector: 'app-education-hierarchy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './education-hierarchy.html',
  styleUrl: './education-hierarchy.css'
})
export class EducationHierarchy implements OnInit {

  // Education data
  readonly programs = signal<EducationProgram[]>([]);
  readonly departments = signal<Department[]>([]);
  readonly educationYears = signal<EducationYear[]>([]);
  readonly subjects = signal<Subject[]>([]);
  readonly topics = signal<Topic[]>([]);
  readonly subtopics = signal<Subtopic[]>([]);

  // Selected IDs
  readonly selectedProgramId = signal<number | null>(null);
  readonly selectedDepartmentId = signal<number | null>(null);
  readonly selectedEducationYearId = signal<number | null>(null);
  readonly selectedSubjectId = signal<number | null>(null);
  readonly selectedTopicId = signal<number | null>(null);
  readonly selectedSubtopicId = signal<number | null>(null);

  // Loading states
  readonly loadingDepartments = signal(false);
  readonly loadingEducationYears = signal(false);
  readonly loadingSubjects = signal(false);
  readonly loadingTopics = signal(false);
  readonly loadingSubtopics = signal(false);

  // Send selected topic/subtopic to the parent
  readonly topicChange = output<number | null>();
  readonly subtopicChange = output<number | null>();

  constructor(
    private programService: AdminEducationProgram,
    private departmentService: AdminDepartment,
    private educationYearService: AdminEducationYear,
    private subjectService: AdminSubject,
    private topicService: AdminTopic,
    private subtopicService: AdminSubtopic
  ) {}

  ngOnInit(): void {
    this.loadPrograms();
  }

  private extractList<T>(response: unknown, key: string): T[] {
    if (Array.isArray(response)) {
      return response as T[];
    }

    if (response !== null && typeof response === 'object' && key in response) {
      const value = (response as Record<string, unknown>)[key];
      return Array.isArray(value) ? value as T[] : [];
    }

    return [];
  }

  private activeRecords<T extends { status?: string }>(records: T[]): T[] {
    return records.filter(
      record => !record.status || record.status === 'active'
    );
  }

  loadPrograms(): void {
    this.programService.getProgramsForMentor().subscribe({
      next: response => {
        this.programs.set(
          this.activeRecords(
            this.extractList<EducationProgram>(response, 'programs')
          )
        );
      },
      error: error => console.error('Failed to load programs:', error)
    });
  }

  onProgramChange(programId: number | null): void {
    this.selectedProgramId.set(programId);
    this.clearDepartmentsAndChildren();

    if (programId === null) return;

    this.loadingDepartments.set(true);

    this.departmentService.getDepartmentsByProgramForMentor(programId).subscribe({
      next: response => {
        this.departments.set(
          this.activeRecords(
            this.extractList<Department>(response, 'departments')
          )
        );
        this.loadingDepartments.set(false);
      },
      error: error => {
        console.error('Failed to load departments:', error);
        this.loadingDepartments.set(false);
      }
    });
  }

  onDepartmentChange(departmentId: number | null): void {
    this.selectedDepartmentId.set(departmentId);
    this.clearYearsAndChildren();

    if (departmentId === null) return;

    this.loadingEducationYears.set(true);

    this.educationYearService
      .getEducationYearsByDepartmentForMentor(departmentId)
      .subscribe({
        next: response => {
          this.educationYears.set(
            this.activeRecords(
              this.extractList<EducationYear>(response, 'years')
            )
          );
          this.loadingEducationYears.set(false);
        },
        error: error => {
          console.error('Failed to load education years:', error);
          this.loadingEducationYears.set(false);
        }
      });
  }

  onEducationYearChange(yearId: number | null): void {
    this.selectedEducationYearId.set(yearId);
    this.clearSubjectsAndChildren();

    if (yearId === null) return;

    this.loadingSubjects.set(true);

    this.subjectService.getSubjectsByYearForMentor(yearId).subscribe({
      next: response => {
        this.subjects.set(
          this.activeRecords(
            this.extractList<Subject>(response, 'subjects')
          )
        );
        this.loadingSubjects.set(false);
      },
      error: error => {
        console.error('Failed to load subjects:', error);
        this.loadingSubjects.set(false);
      }
    });
  }

  onSubjectChange(subjectId: number | null): void {
    this.selectedSubjectId.set(subjectId);
    this.clearTopicsAndChildren();

    if (subjectId === null) return;

    this.loadingTopics.set(true);

    this.topicService.getTopicsBySubjectForMentor(subjectId).subscribe({
      next: response => {
        this.topics.set(
          this.activeRecords(
            this.extractList<Topic>(response, 'topics')
          )
        );
        this.loadingTopics.set(false);
      },
      error: error => {
        console.error('Failed to load topics:', error);
        this.loadingTopics.set(false);
      }
    });
  }

  onTopicChange(topicId: number | null): void {
    this.selectedTopicId.set(topicId);
    this.clearSubtopics();

    this.topicChange.emit(topicId);

    if (topicId === null) return;

    this.loadingSubtopics.set(true);

    this.subtopicService.getSubtopicsForMentor(topicId).subscribe({
      next: response => {
        this.subtopics.set(
          this.activeRecords(
            this.extractList<Subtopic>(response, 'subtopics')
          )
        );
        this.loadingSubtopics.set(false);
      },
      error: error => {
        console.error('Failed to load subtopics:', error);
        this.loadingSubtopics.set(false);
      }
    });
  }

  onSubtopicChange(subtopicId: number | null): void {
    this.selectedSubtopicId.set(subtopicId);
    this.subtopicChange.emit(subtopicId);
  }

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
    this.topicChange.emit(null);
  }

  private clearSubtopics(): void {
    this.subtopics.set([]);
    this.selectedSubtopicId.set(null);
    this.loadingSubtopics.set(false);
    this.subtopicChange.emit(null);
  }
}
