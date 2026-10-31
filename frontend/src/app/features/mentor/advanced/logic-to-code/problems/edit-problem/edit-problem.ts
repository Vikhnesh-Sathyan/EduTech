
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  LogicToCodeService,
  LogicToCodeProblem,
  UpdateLogicToCodeProblem
} from '../../../../../../services/mentor/advanced/logic-to-code/logic-to-code.service';

import { AdminEducationProgram } from '../../../../../../services/admin/admin-education-program';
import { AdminEducationYear } from '../../../../../../services/admin/admin-education-year';
import { AdminSubject } from '../../../../../../services/admin/admin-subjects';

import { ToastService } from '../../../../../../services/toast.service';

interface EditProblemData extends LogicToCodeProblem {
  program_id: number | null;
  department_id: number | null;
  education_year_id: number | null;
}

@Component({
  selector: 'app-edit-problem',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-problem.html',
  styleUrl: './edit-problem.css'
})
export class EditProblem implements OnInit {

  private logicToCodeService = inject(LogicToCodeService);
  private programService = inject(AdminEducationProgram);
  private yearService = inject(AdminEducationYear);
  private subjectService = inject(AdminSubject);
  private toastService = inject(ToastService);

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // ==========================================
  // PROBLEM ID
  // ==========================================

  problemId = 0;

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

  loadingProblem = signal(true);
  saving = signal(false);

  errorMessage = signal('');
  successMessage = signal('');

  // ==========================================
  // INITIAL LOAD
  // ==========================================
ngOnInit(): void {
  const id = Number(this.route.snapshot.paramMap.get('problemId'));

  if (!Number.isInteger(id) || id <= 0) {
    this.errorMessage.set('Invalid problem ID.');
    this.loadingProblem.set(false);
    return;
  }

  this.problemId = id;
  this.loadProblem();
}
 
  // ==========================================
  // LOAD EXISTING PROBLEM
  // ==========================================

loadProblem(): void {
  this.loadingProblem.set(true);

  this.logicToCodeService.getProblemById(this.problemId).subscribe({
    next: (response) => {
      const problem = response.problem as LogicToCodeProblem & {
        program_id: number;
        department_id: number;
        education_year_id: number;
      };

      // Load existing problem details
      this.title.set(problem.title);
      this.description.set(problem.description);
      this.difficulty.set(problem.difficulty);
      this.solutionUnlock.set(problem.solution_unlock);

      // Load and preselect academic hierarchy
      this.loadAcademicSelections(problem);
    },

    error: (error) => {
      console.error('Load Problem Error:', error);
      this.errorMessage.set(
        error.error?.message || 'Unable to load problem.'
      );
      this.loadingProblem.set(false);
    }
  });
}


private normalizeId(value: number | string | null): number | null {
  if (value === null || value === '') return null;

  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

private loadAcademicSelections(
  problem: EditProblemData
): void {
  this.loadingPrograms.set(true);

  this.programService.getProgramsForMentor().subscribe({
    next: (response) => {
      const programs = response.programs ?? [];
      this.programs.set(programs);
      this.loadingPrograms.set(false);

      const programId = this.normalizeId(problem.program_id);

      if (
        programId === null ||
        !programs.some((p: any) => Number(p.id) === programId)
      ) {
        this.failHierarchy('Unable to identify the education program.');
        return;
      }

      this.selectedProgramId.set(programId);
      this.loadDepartmentsAndHierarchy(problem);
    },
    error: (error) => {
      console.error('Load Programs Error:', error);
      this.loadingPrograms.set(false);
      this.failHierarchy('Unable to load education programs.');
    }
  });
}

private loadDepartmentsAndHierarchy(problem: EditProblemData): void {
  const programId = this.selectedProgramId();

  if (programId === null) {
    this.failHierarchy('Please select an education program.');
    return;
  }

  this.loadingDepartments.set(true);

  this.programService.getDepartmentsByProgramForMentor(programId).subscribe({
    next: (response) => {
      const departments = response.departments ?? [];
      this.departments.set(departments);
      this.loadingDepartments.set(false);

      const departmentId = this.normalizeId(problem.department_id);

      if (
        departmentId === null ||
        !departments.some((d: any) => Number(d.id) === departmentId)
      ) {
        this.failHierarchy('Unable to identify the department.');
        return;
      }

      this.selectedDepartmentId.set(departmentId);
      this.loadYearsAndHierarchy(problem);
    },
    error: (error) => {
      console.error('Load Departments Error:', error);
      this.loadingDepartments.set(false);
      this.failHierarchy('Unable to load departments.');
    }
  });
}

private loadYearsAndHierarchy(problem: EditProblemData): void {
  const departmentId = this.selectedDepartmentId();

  if (departmentId === null) {
    this.failHierarchy('Please select a department.');
    return;
  }

  this.loadingYears.set(true);

  this.yearService.getEducationYearsByDepartmentForMentor(departmentId).subscribe({
    next: (response) => {
      const years = response.years ?? [];
      this.educationYears.set(years);
      this.loadingYears.set(false);

      const yearId = this.normalizeId(problem.education_year_id);

      if (
        yearId === null ||
        !years.some((y: any) => Number(y.id) === yearId)
      ) {
        this.failHierarchy('Unable to identify the academic year.');
        return;
      }

      this.selectedYearId.set(yearId);
      this.loadSubjectsAndHierarchy(problem);
    },
    error: (error) => {
      console.error('Load Academic Years Error:', error);
      this.loadingYears.set(false);
      this.failHierarchy('Unable to load academic years.');
    }
  });
}

private loadSubjectsAndHierarchy(problem: EditProblemData): void {
  const yearId = this.selectedYearId();

  if (yearId === null) {
    this.failHierarchy('Please select an academic year.');
    return;
  }

  this.loadingSubjects.set(true);

  this.subjectService.getSubjectsByYearForMentor(yearId).subscribe({
    next: (response) => {
      const subjects = response.subjects ?? [];
      this.subjects.set(subjects);

      const subjectId = this.normalizeId(problem.subject_id);

      if (
        subjectId === null ||
        !subjects.some((s: any) => Number(s.id) === subjectId)
      ) {
        this.failHierarchy('Unable to identify the academic subject.');
        return;
      }

      this.selectedSubjectId.set(subjectId);
      this.loadingSubjects.set(false);
      this.loadingProblem.set(false);
    },
    error: (error) => {
      console.error('Load Subjects Error:', error);
      this.loadingSubjects.set(false);
      this.failHierarchy('Unable to load subjects.');
    }
  });
}

private failHierarchy(message: string): void {
  this.errorMessage.set(message);
  this.loadingProblem.set(false);
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
  // UPDATE PROBLEM
  // ==========================================

  updateProblem(): void {

    this.errorMessage.set('');
    this.successMessage.set('');

    const subjectId = this.selectedSubjectId();

    if (!subjectId) {
      this.errorMessage.set('Please select an academic subject.');
      return;
    }

    const problemData: UpdateLogicToCodeProblem = {
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

    this.saving.set(true);

    this.logicToCodeService
      .updateProblem(this.problemId, problemData)
      .subscribe({

        next: (response) => {

          this.saving.set(false);

          this.successMessage.set(
            response.message || 'Problem updated successfully.'
          );

          this.toastService.success(
            response.message || 'Problem updated successfully.'
          );

          setTimeout(() => {
            this.router.navigate([
              '/mentor/advanced/logic-to-code/problems',
              this.problemId
            ]);
          }, 1000);

        },

        error: (error) => {

          console.error('Update Problem Error:', error);

          this.saving.set(false);

          this.errorMessage.set(
            error.error?.message || 'Unable to update problem.'
          );

          this.toastService.error(
            error.error?.message || 'Unable to update problem.'
          );

        }

      });
  }

  // ==========================================
  // CANCEL EDITING
  // ==========================================

  cancel(): void {

    this.router.navigate([
      '/mentor/advanced/logic-to-code/problems',
      this.problemId
    ]);

  }

}
