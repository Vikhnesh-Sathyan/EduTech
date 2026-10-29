
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CodeToLogicService } from '../../../../../services/mentor/advanced/code-to-logic/code-to-logic.service';
import { AdminEducationProgram } from '../../../../../services/admin/admin-education-program';
import { AdminEducationYear } from '../../../../../services/admin/admin-education-year';
import { AdminSubject } from '../../../../../services/admin/admin-subjects';
import { ToastService } from '../../../../../services/toast.service';

interface CodeToLogicTask {
  id: number;
  subject_id: number;
  subject_name?: string;
  program_id: number | null;
  department_id: number | null;
  education_year_id: number | null;
  title: string;
  description: string;
  code_content: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

interface Subject {
  id: number;
  name: string;
  education_year_id?: number;
}

@Component({
  selector: 'app-code-to-logic-task-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-edit.html',
  styleUrl: './task-edit.css'
})
export class TaskEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly codeToLogicService = inject(CodeToLogicService);
  private readonly programService = inject(AdminEducationProgram);
  private readonly yearService = inject(AdminEducationYear);
  private readonly subjectService = inject(AdminSubject);
  private readonly toastService = inject(ToastService);

  taskId = 0;

  loading = signal(true);
  saving = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  programs = signal<any[]>([]);
  departments = signal<any[]>([]);
  educationYears = signal<any[]>([]);
  subjects = signal<Subject[]>([]);

  selectedProgramId = signal<number | null>(null);
  selectedDepartmentId = signal<number | null>(null);
  selectedYearId = signal<number | null>(null);

  loadingPrograms = signal(false);
  loadingDepartments = signal(false);
  loadingYears = signal(false);
  loadingSubjects = signal(false);

  subjectId: number | null = null;
  title = '';
  description = '';
  codeContent = '';

  taskStatus = signal<'draft' | 'published' | 'archived'>('draft');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('taskId'));

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage.set('Invalid task ID.');
      this.loading.set(false);
      return;
    }

    this.taskId = id;
    this.loadTask();
  }

  private normalizeId(value: number | string | null): number | null {
    if (value === null || value === '') {
      return null;
    }

    const id = Number(value);

    return Number.isInteger(id) && id > 0 ? id : null;
  }

  loadTask(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.codeToLogicService.getTask(this.taskId).subscribe({
      next: response => {
        const task = response.task as unknown as CodeToLogicTask;

        this.subjectId = Number(task.subject_id);
        this.title = task.title;
        this.description = task.description;
        this.codeContent = task.code_content;
        this.taskStatus.set(task.status);

        this.loadProgramsAndHierarchy(task);
      },
      error: error => {
        console.error('Failed to load task:', error);

        this.errorMessage.set(
          error.error?.message || 'Unable to load task details.'
        );

        this.loading.set(false);
      }
    });
  }

  private loadProgramsAndHierarchy(task: CodeToLogicTask): void {
    this.loadingPrograms.set(true);

    this.programService.getProgramsForMentor().subscribe({
      next: response => {
        const programs = response.programs ?? [];
        this.programs.set(programs);
        this.loadingPrograms.set(false);

        const programId = this.normalizeId(task.program_id);

        if (
          programId === null ||
          !programs.some((program: any) => Number(program.id) === programId)
        ) {
          this.failHierarchy('Unable to identify the task education program.');
          return;
        }

        this.selectedProgramId.set(programId);
        this.loadDepartmentsAndHierarchy(task);
      },
      error: error => {
        console.error('Failed to load programs:', error);
        this.loadingPrograms.set(false);
        this.failHierarchy('Failed to load education programs.');
      }
    });
  }

  onProgramChange(value: number | string | null): void {
    const programId = this.normalizeId(value);

    this.selectedProgramId.set(programId);
    this.selectedDepartmentId.set(null);
    this.selectedYearId.set(null);

    this.departments.set([]);
    this.educationYears.set([]);
    this.subjects.set([]);
    this.subjectId = null;

    if (programId === null) {
      return;
    }

    this.loadingDepartments.set(true);

    this.programService
      .getDepartmentsByProgramForMentor(programId)
      .subscribe({
        next: response => {
          this.departments.set(response.departments ?? []);
          this.loadingDepartments.set(false);
        },
        error: error => {
          console.error('Failed to load departments:', error);
          this.loadingDepartments.set(false);
          this.toastService.error('Failed to load departments.');
        }
      });
  }

  private loadDepartmentsAndHierarchy(task: CodeToLogicTask): void {
    const programId = this.selectedProgramId();

    if (programId === null) {
      this.failHierarchy('Please select an education program.');
      return;
    }

    this.loadingDepartments.set(true);

    this.programService
      .getDepartmentsByProgramForMentor(programId)
      .subscribe({
        next: response => {
          const departments = response.departments ?? [];
          this.departments.set(departments);
          this.loadingDepartments.set(false);

          const departmentId = this.normalizeId(task.department_id);

          if (
            departmentId === null ||
            !departments.some(
              (department: any) => Number(department.id) === departmentId
            )
          ) {
            this.failHierarchy('Unable to identify the task department.');
            return;
          }

          this.selectedDepartmentId.set(departmentId);
          this.loadYearsAndHierarchy(task);
        },
        error: error => {
          console.error('Failed to load departments:', error);
          this.loadingDepartments.set(false);
          this.failHierarchy('Failed to load departments.');
        }
      });
  }

  onDepartmentChange(value: number | string | null): void {
    const departmentId = this.normalizeId(value);

    this.selectedDepartmentId.set(departmentId);
    this.selectedYearId.set(null);

    this.educationYears.set([]);
    this.subjects.set([]);
    this.subjectId = null;

    if (departmentId === null) {
      return;
    }

    this.loadingYears.set(true);

    this.yearService
      .getEducationYearsByDepartmentForMentor(departmentId)
      .subscribe({
        next: response => {
          this.educationYears.set(response.years ?? []);
          this.loadingYears.set(false);
        },
        error: error => {
          console.error('Failed to load academic years:', error);
          this.loadingYears.set(false);
          this.toastService.error('Failed to load academic years.');
        }
      });
  }

  private loadYearsAndHierarchy(task: CodeToLogicTask): void {
    const departmentId = this.selectedDepartmentId();

    if (departmentId === null) {
      this.failHierarchy('Please select a department.');
      return;
    }

    this.loadingYears.set(true);

    this.yearService
      .getEducationYearsByDepartmentForMentor(departmentId)
      .subscribe({
        next: response => {
          const years = response.years ?? [];
          this.educationYears.set(years);
          this.loadingYears.set(false);

          const yearId = this.normalizeId(task.education_year_id);

          if (
            yearId === null ||
            !years.some((year: any) => Number(year.id) === yearId)
          ) {
            this.failHierarchy('Unable to identify the task academic year.');
            return;
          }

          this.selectedYearId.set(yearId);
          this.loadSubjectsAndHierarchy(task);
        },
        error: error => {
          console.error('Failed to load academic years:', error);
          this.loadingYears.set(false);
          this.failHierarchy('Failed to load academic years.');
        }
      });
  }

  onYearChange(value: number | string | null): void {
    const yearId = this.normalizeId(value);

    this.selectedYearId.set(yearId);
    this.subjects.set([]);
    this.subjectId = null;

    if (yearId === null) {
      return;
    }

    this.loadSubjectsForYear(yearId);
  }

  private loadSubjectsAndHierarchy(task: CodeToLogicTask): void {
    const yearId = this.selectedYearId();

    if (yearId === null) {
      this.failHierarchy('Please select an academic year.');
      return;
    }

    this.loadingSubjects.set(true);

    this.subjectService.getSubjectsByYearForMentor(yearId).subscribe({
      next: response => {
        const subjects: Subject[] = response.subjects ?? [];

        // Preserve the existing subject even if it is no longer
        // included in the mentor's available subject list.
        if (!subjects.some(subject => Number(subject.id) === Number(task.subject_id))) {
          subjects.unshift({
            id: Number(task.subject_id),
            name: task.subject_name || 'Current subject',
            education_year_id: yearId
          });
        }

        this.subjects.set(subjects);
        this.subjectId = Number(task.subject_id);
        this.loadingSubjects.set(false);
        this.loading.set(false);
      },
      error: error => {
        console.error('Failed to load subjects:', error);
        this.loadingSubjects.set(false);
        this.failHierarchy('Failed to load subjects.');
      }
    });
  }

  private loadSubjectsForYear(yearId: number): void {
    this.loadingSubjects.set(true);

    this.subjectService.getSubjectsByYearForMentor(yearId).subscribe({
      next: response => {
        this.subjects.set(response.subjects ?? []);
        this.loadingSubjects.set(false);
      },
      error: error => {
        console.error('Failed to load subjects:', error);
        this.loadingSubjects.set(false);
        this.toastService.error('Failed to load subjects.');
      }
    });
  }

  private failHierarchy(message: string): void {
    this.errorMessage.set(message);
    this.loading.set(false);
  }

  saveChanges(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    const cleanTitle = this.title.trim();
    const cleanDescription = this.description.trim();
    const cleanCode = this.codeContent.trim();

    if (
      this.subjectId === null ||
      !Number.isInteger(Number(this.subjectId)) ||
      Number(this.subjectId) <= 0
    ) {
      this.errorMessage.set('Please select a valid subject.');
      return;
    }

    if (!cleanTitle || !cleanDescription || !cleanCode) {
      this.errorMessage.set(
        'Please complete the title, description and code fields.'
      );
      return;
    }

    if (this.saving()) {
      return;
    }

    this.saving.set(true);

    this.codeToLogicService.updateTask(this.taskId, {
      subject_id: Number(this.subjectId),
      title: cleanTitle,
      description: cleanDescription,
      code_content: cleanCode
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.toastService.success('Task updated successfully.');

        this.router.navigate([
          '/mentor/advanced/code-to-logic/tasks',
          this.taskId,
          'view'
        ]);
      },
      error: error => {
        console.error('Failed to update task:', error);

        this.errorMessage.set(
          error.error?.message || 'Unable to save changes. Please try again.'
        );

        this.saving.set(false);
      }
    });
  }

  cancelEdit(): void {
    this.router.navigate([
      '/mentor/advanced/code-to-logic/tasks',
      this.taskId,
      'view'
    ]);
  }
}
