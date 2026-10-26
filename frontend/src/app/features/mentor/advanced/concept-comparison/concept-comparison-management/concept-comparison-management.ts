
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  ConceptComparisonService,
  CreateComparisonRequest
} from '../../../../../services/mentor/advanced/concept-comparison/concept-comparison.service';

import {
  ConceptComparisonRows,
  ComparisonRowDraft
} from '../concept-comparison-rows/concept-comparison-rows';

import { AdminEducationProgram } from '../../../../../services/admin/admin-education-program';
import { AdminEducationYear } from '../../../../../services/admin/admin-education-year';
import { AdminSubject } from '../../../../../services/admin/admin-subjects';

interface ComparisonConceptDraft {
  id: number;
  name: string;
}

@Component({
  selector: 'app-concept-comparison-management',
  standalone: true,
  imports: [
    FormsModule,
    ConceptComparisonRows
  ],
  templateUrl: './concept-comparison-management.html',
  styleUrl: './concept-comparison-management.css'
})
export class ConceptComparisonManagement implements OnInit {

  readonly Number = Number;
  
  title = '';
  description = '';

  // Dynamic academic dropdown data
  programs = signal<any[]>([]);
  educationYears = signal<any[]>([]);
  subjects = signal<any[]>([]);

  selectedProgramId = signal<number | null>(null);
  selectedYearId = signal<number | null>(null);
  selectedSubjectId = signal<number | null>(null);

  loadingPrograms = signal(false);
  loadingYears = signal(false);
  loadingSubjects = signal(false);

  saving = signal(false);
  message = signal('');
  errorMessage = signal('');

  departments = signal<any[]>([]);
selectedDepartmentId = signal<number | null>(null);
loadingDepartments = signal(false);
  

  selectedImage: File | null = null;
  selectedImageName = '';

  rows: ComparisonRowDraft[] = [];

  private nextConceptId = 3;

  concepts: ComparisonConceptDraft[] = [
    { id: 1, name: '' },
    { id: 2, name: '' }
  ];

  constructor(
    private comparisonService: ConceptComparisonService,
    private programService: AdminEducationProgram,
    private yearService: AdminEducationYear,
    private subjectService: AdminSubject
  ) {}

  ngOnInit(): void {
    this.loadPrograms();
  }

  loadPrograms(): void {
    this.loadingPrograms.set(true);
    this.errorMessage.set('');

    this.programService.getProgramsForMentor().subscribe({
      next: (response: any) => {
        this.programs.set(response.programs ?? []);
        this.loadingPrograms.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load programs.');
        this.loadingPrograms.set(false);
      }
    });
  }

onProgramChange(programId: number | null): void {
  this.selectedProgramId.set(programId);
  this.selectedDepartmentId.set(null);
  this.selectedYearId.set(null);
  this.selectedSubjectId.set(null);

  this.departments.set([]);
  this.educationYears.set([]);
  this.subjects.set([]);

  this.loadingDepartments.set(false);
  this.loadingYears.set(false);
  this.errorMessage.set('');

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

        if (!response.departments?.length) {
          this.errorMessage.set(
            'No departments are available for this program.'
          );
        }
      },
      error: error => {
        console.error('Failed to load departments:', error);
        this.departments.set([]);
        this.loadingDepartments.set(false);
        this.errorMessage.set('Failed to load departments.');
      }
    });
}

onDepartmentChange(departmentId: number | null): void {
  this.selectedDepartmentId.set(departmentId);
  this.selectedYearId.set(null);
  this.selectedSubjectId.set(null);

  this.educationYears.set([]);
  this.subjects.set([]);
  this.loadingYears.set(false);
  this.errorMessage.set('');

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

        if (!response.years?.length) {
          this.errorMessage.set(
            'No academic years are available for this department.'
          );
        }
      },
      error: error => {
        console.error('Failed to load academic years:', error);
        this.educationYears.set([]);
        this.loadingYears.set(false);
        this.errorMessage.set('Failed to load academic years.');
      }
    });
}

  onYearChange(yearId: number | null): void {
    this.selectedYearId.set(yearId);
    this.selectedSubjectId.set(null);
    this.subjects.set([]);

    if (yearId === null) return;

    this.loadingSubjects.set(true);
    this.errorMessage.set('');

    this.subjectService
      .getSubjectsByYearForMentor(yearId)
      .subscribe({
        next: (response: any) => {
          this.subjects.set(response.subjects ?? []);
          this.loadingSubjects.set(false);
        },
        error: () => {
          this.errorMessage.set('Failed to load subjects.');
          this.loadingSubjects.set(false);
        }
      });
  }

  addConcept(): void {
    this.concepts = [
      ...this.concepts,
      { id: this.nextConceptId++, name: '' }
    ];
    this.onConceptsChanged();
  }

  removeConcept(index: number): void {
    if (this.concepts.length <= 2) return;

    this.concepts = this.concepts.filter((_, i) => i !== index);
    this.onConceptsChanged();
  }

  onConceptsChanged(): void {
    // The child receives the updated concepts array.
  }

  onRowsChange(rows: ComparisonRowDraft[]): void {
    this.rows = rows;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedImage = null;
    this.selectedImageName = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorMessage.set('Please select a valid image file.');
      input.value = '';
      return;
    }

    this.selectedImage = file;
    this.selectedImageName = file.name;
    this.errorMessage.set('');
  }

  createComparison(): void {
    this.message.set('');
    this.errorMessage.set('');

    const subjectId = this.selectedSubjectId();

    if (
      !this.title.trim() ||
      !this.description.trim() ||
      subjectId === null ||
      !Number.isInteger(subjectId) ||
      subjectId <= 0
    ) {
      this.errorMessage.set(
        'Complete the title, description, program, academic year and subject.'
      );
      return;
    }

    const conceptNames = this.concepts.map(concept =>
      concept.name.trim()
    );

    if (
      conceptNames.some(name => !name) ||
      new Set(conceptNames.map(name => name.toLowerCase())).size !==
        conceptNames.length
    ) {
      this.errorMessage.set(
        'Enter a unique name for every comparison concept.'
      );
      return;
    }

    if (
      this.rows.length === 0 ||
      this.rows.some(row =>
        !row.pointTitle.trim() ||
        row.cells.length !== this.concepts.length ||
        row.cells.some(cell => !cell.content.trim())
      )
    ) {
      this.errorMessage.set(
        'Complete every comparison point and provide a value for each concept.'
      );
      return;
    }

    const comparisonData: CreateComparisonRequest = {
      title: this.title.trim(),
      description: this.description.trim(),
      subjectId,
      concepts: conceptNames.map(name => ({ name })),
      rows: this.rows.map(row => ({
        pointTitle: row.pointTitle.trim(),
        cells: row.cells.map(cell => ({
          content: cell.content.trim()
        }))
      }))
    };

    this.saving.set(true);

    this.comparisonService.createComparison(comparisonData).subscribe({
      next: response => {
        this.saving.set(false);
        this.message.set(response.message);
        this.resetForm();
      },
      error: error => {
        this.saving.set(false);
        this.errorMessage.set(
          error.error?.message || 'Failed to save the comparison.'
        );
      }
    });
  }

  private resetForm(): void {
    this.title = '';
    this.description = '';

    this.selectedProgramId.set(null);
    this.selectedYearId.set(null);
    this.selectedSubjectId.set(null);

    this.selectedDepartmentId.set(null);
this.departments.set([]);
this.loadingDepartments.set(false);
this.loadingYears.set(false);

    this.educationYears.set([]);
    this.subjects.set([]);

    this.concepts = [
      { id: 1, name: '' },
      { id: 2, name: '' }
    ];

    this.nextConceptId = 3;
    this.rows = [];

    this.selectedImage = null;
    this.selectedImageName = '';
  }
}
