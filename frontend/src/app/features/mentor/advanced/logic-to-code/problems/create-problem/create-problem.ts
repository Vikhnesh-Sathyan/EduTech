
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  LogicToCodeService,
  CreateLogicToCodeProblem
} from '../../../../../../services/mentor/advanced/logic-to-code/logic-to-code.service';

import { AdminEducationProgram } from '../../../../../../services/admin/admin-education-program';
import { AdminEducationYear } from '../../../../../../services/admin/admin-education-year';
import { AdminSubject } from '../../../../../../services/admin/admin-subjects';

import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-create-problem',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-problem.html',
  styleUrl: './create-problem.css'
})
export class CreateProblem implements OnInit {

  private logicToCodeService = inject(LogicToCodeService);
  private router = inject(Router);

  private programService = inject(AdminEducationProgram);
  private yearService = inject(AdminEducationYear);
  private subjectService = inject(AdminSubject);
  private toastService = inject(ToastService);

  // ==========================================
  // ACADEMIC DROPDOWN DATA
  // ==========================================

  programs = signal<any[]>([]);
  departments = signal<any[]>([]);
  educationYears = signal<any[]>([]);
  subjects = signal<any[]>([]);

  // ==========================================
  // SELECTED ACADEMIC IDs
  // ==========================================

  selectedProgramId = signal<number | null>(null);
  selectedDepartmentId = signal<number | null>(null);
  selectedYearId = signal<number | null>(null);
  selectedSubjectId = signal<number | null>(null);

  // ==========================================
  // DROPDOWN LOADING STATES
  // ==========================================

  loadingPrograms = signal(false);
  loadingDepartments = signal(false);
  loadingYears = signal(false);
  loadingSubjects = signal(false);

  // ==========================================
  // FORM FIELDS
  // ==========================================

  title = signal('');
  description = signal('');

  difficulty = signal<'easy' | 'medium' | 'hard'>('easy');

  solutionUnlock = signal<
    'after_attempt' | 'after_completion' | 'mentor_only'
  >('after_completion');

  // ==========================================
  // UI STATES
  // ==========================================

  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  ngOnInit(): void {
    this.loadPrograms();
  }

  // ==========================================
  // LOAD EDUCATION PROGRAMS
  // ==========================================

  loadPrograms(): void {

    this.loadingPrograms.set(true);

    this.programService.getProgramsForMentor().subscribe({

      next: (response) => {
        this.programs.set(response.programs ?? []);
        this.loadingPrograms.set(false);
      },

      error: (error) => {
        console.error('Load Programs Error:', error);
        this.loadingPrograms.set(false);
        this.errorMessage.set('Unable to load education programs.');
      }

    });
  }

  // ==========================================
  // PROGRAM CHANGE
  // ==========================================

  onProgramChange(programId: number | null): void {

    this.selectedProgramId.set(programId);

    this.selectedDepartmentId.set(null);
    this.selectedYearId.set(null);
    this.selectedSubjectId.set(null);

    this.departments.set([]);
    this.educationYears.set([]);
    this.subjects.set([]);

    if (!programId) return;

    this.loadingDepartments.set(true);

    this.programService
      .getDepartmentsByProgramForMentor(programId)
      .subscribe({

        next: (response) => {
          this.departments.set(response.departments ?? []);
          this.loadingDepartments.set(false);
        },

        error: (error) => {
          console.error('Load Departments Error:', error);
          this.loadingDepartments.set(false);
          this.errorMessage.set('Unable to load departments.');
        }

      });
  }

  // ==========================================
  // DEPARTMENT CHANGE
  // ==========================================

  onDepartmentChange(departmentId: number | null): void {

    this.selectedDepartmentId.set(departmentId);

    this.selectedYearId.set(null);
    this.selectedSubjectId.set(null);

    this.educationYears.set([]);
    this.subjects.set([]);

    if (!departmentId) return;

    this.loadingYears.set(true);

    this.yearService
      .getEducationYearsByDepartmentForMentor(departmentId)
      .subscribe({

        next: (response) => {
          this.educationYears.set(response.years ?? []);
          this.loadingYears.set(false);
        },

        error: (error) => {
          console.error('Load Education Years Error:', error);
          this.loadingYears.set(false);
          this.errorMessage.set('Unable to load academic years.');
        }

      });
  }

  // ==========================================
  // ACADEMIC YEAR CHANGE
  // ==========================================

  onYearChange(yearId: number | null): void {

    this.selectedYearId.set(yearId);

    this.selectedSubjectId.set(null);
    this.subjects.set([]);

    if (!yearId) return;

    this.loadingSubjects.set(true);

    this.subjectService
      .getSubjectsByYearForMentor(yearId)
      .subscribe({

        next: (response) => {
          this.subjects.set(response.subjects ?? []);
          this.loadingSubjects.set(false);
        },

        error: (error) => {
          console.error('Load Subjects Error:', error);
          this.loadingSubjects.set(false);
          this.errorMessage.set('Unable to load subjects.');
        }

      });
  }

  // ==========================================
  // SUBJECT CHANGE
  // ==========================================

  onSubjectChange(subjectId: number | null): void {
    this.selectedSubjectId.set(subjectId);
  }

  // ==========================================
  // CREATE PROBLEM
  // ==========================================

  createProblem(): void {

    this.errorMessage.set('');
    this.successMessage.set('');

    const subjectId = this.selectedSubjectId();

    if (!subjectId) {
      this.errorMessage.set('Please select an academic subject.');
      return;
    }

    const problemData: CreateLogicToCodeProblem = {
      subject_id: subjectId,
      title: this.title().trim(),
      description: this.description().trim(),
      difficulty: this.difficulty(),
      solution_unlock: this.solutionUnlock()
    };

    if (!problemData.title || !problemData.description) {
      this.errorMessage.set(
        'Please enter both title and description.'
      );
      return;
    }

    this.loading.set(true);

    this.logicToCodeService.createProblem(problemData).subscribe({

      next: (response) => {

        this.loading.set(false);

        this.successMessage.set(
          response.message || 'Problem created successfully.'
        );

        this.toastService.success(
          response.message || 'Problem created successfully.'
        );

        setTimeout(() => {
          this.router.navigate([
            '/mentor/advanced/logic-to-code/problems'
          ]);
        }, 1000);

      },

      error: (error) => {

        console.error('Create Problem Error:', error);

        this.loading.set(false);

        this.errorMessage.set(
          error.error?.message || 'Unable to create problem.'
        );

        this.toastService.error(
          error.error?.message || 'Unable to create problem.'
        );

      }

    });
  }

  // ==========================================
  // CANCEL CREATION
  // ==========================================

  cancel(): void {
    this.router.navigate([
      '/mentor/advanced/logic-to-code/problems'
    ]);
  }

}
