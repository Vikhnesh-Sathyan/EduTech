
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { CodeToLogicService } from '../../../../../services/mentor/advanced/code-to-logic/code-to-logic.service';

import { AdminEducationProgram } from '../../../../../services/admin/admin-education-program';
import { AdminEducationYear } from '../../../../../services/admin/admin-education-year';
import { AdminSubject } from '../../../../../services/admin/admin-subjects';

import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-code-to-logic-create-task',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './create-task.html',
  styleUrl: './create-task.css'
})
export class CreateTaskComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly codeToLogicService = inject(CodeToLogicService);
  private readonly programService = inject(AdminEducationProgram);
  private readonly yearService = inject(AdminEducationYear);
  private readonly subjectService = inject(AdminSubject);
  private readonly toastService = inject(ToastService);

  readonly programs = signal<any[]>([]);
  readonly departments = signal<any[]>([]);
  readonly educationYears = signal<any[]>([]);
  readonly subjects = signal<any[]>([]);

  readonly selectedProgramId = signal<number | null>(null);
  readonly selectedDepartmentId = signal<number | null>(null);
  readonly selectedYearId = signal<number | null>(null);

  readonly loadingPrograms = signal(false);
  readonly loadingDepartments = signal(false);
  readonly loadingYears = signal(false);
  readonly loadingSubjects = signal(false);

  readonly saving = signal(false);

  readonly taskForm = this.fb.group({
    subject_id: this.fb.control<number | null>(
      null,
      Validators.required
    ),

    title: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(200)
    ]),

    description: this.fb.nonNullable.control('', [
      Validators.required
    ]),

    code_content: this.fb.nonNullable.control('', [
      Validators.required
    ])
  });

  ngOnInit(): void {
    this.loadPrograms();
  }

  loadPrograms(): void {
    this.loadingPrograms.set(true);

    this.programService.getProgramsForMentor().subscribe({
      next: response => {
        this.programs.set(response.programs ?? []);
        this.loadingPrograms.set(false);
      },
      error: error => {
        console.error('Failed to load programs:', error);
        this.loadingPrograms.set(false);
        this.toastService.error('Failed to load education programs.');
      }
    });
  }

  onProgramChange(programId: number | null): void {
    this.selectedProgramId.set(programId);
    this.selectedDepartmentId.set(null);
    this.selectedYearId.set(null);

    this.departments.set([]);
    this.educationYears.set([]);
    this.subjects.set([]);

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

  onDepartmentChange(departmentId: number | null): void {
    this.selectedDepartmentId.set(departmentId);
    this.selectedYearId.set(null);

    this.educationYears.set([]);
    this.subjects.set([]);

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

  onYearChange(yearId: number | null): void {
    this.selectedYearId.set(yearId);
    this.taskForm.controls.subject_id.setValue(null);
    this.subjects.set([]);

    if (yearId === null) {
      return;
    }

    this.loadingSubjects.set(true);

    this.subjectService
      .getSubjectsByYearForMentor(yearId)
      .subscribe({
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

  saveTask(status: 'draft' | 'published'): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      this.toastService.error('Please complete all required fields.');
      return;
    }

    const values = this.taskForm.getRawValue();

    if (!values.subject_id || values.subject_id <= 0) {
      this.toastService.error('Please select a subject.');
      return;
    }

    const payload = {
      subject_id: values.subject_id,
      title: values.title.trim(),
      description: values.description.trim(),
      code_content: values.code_content.trim(),
      status
    };

    this.saving.set(true);

    this.codeToLogicService.createTask(payload).subscribe({
      next: response => {
        this.saving.set(false);
        this.toastService.success(
          response.message || 'Task saved successfully.'
        );
        this.resetForm();
      },
      error: error => {
        console.error('Failed to save Code to Logic task:', error);
        this.saving.set(false);
        this.toastService.error(
          error.error?.message || 'Failed to save the task.'
        );
      }
    });
  }

  private resetForm(): void {
    this.taskForm.reset({
      subject_id: null,
      title: '',
      description: '',
      code_content: ''
    });

    this.selectedProgramId.set(null);
    this.selectedDepartmentId.set(null);
    this.selectedYearId.set(null);

    this.departments.set([]);
    this.educationYears.set([]);
    this.subjects.set([]);
  }
}
