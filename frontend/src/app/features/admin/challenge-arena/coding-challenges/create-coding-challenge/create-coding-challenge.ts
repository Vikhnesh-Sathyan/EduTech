import { Component, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AdminSubject } from '../../../../../services/admin/admin-subjects';
import { AdminEducationProgram } from '../../../../../services/admin/admin-education-program';
import { AdminDepartment } from '../../../../../services/admin/admin-department';
import { AdminEducationYear } from '../../../../../services/admin/admin-education-year';

import { CodingChallengeService } from '../../../../../services/admin/challenge-arena/coding/coding-challenge';

@Component({
  selector: 'app-create-coding-challenge',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './create-coding-challenge.html',
  styleUrl: './create-coding-challenge.css'
})
export class CreateCodingChallenge implements OnInit {

  programs = signal<any[]>([]);
  departments = signal<any[]>([]);
  years = signal<any[]>([]);
  subjects = signal<any[]>([]);
  challengeTypes = signal<any[]>([]);
  contentSchema = signal<any[]>([]);

  loading = signal(false);
  saving = signal(false);

  message = '';
  errorMessage = '';

  challengeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private subjectService: AdminSubject,
    private programService: AdminEducationProgram,
    private departmentService: AdminDepartment,
    private educationYearService: AdminEducationYear,
    private challengeService: CodingChallengeService,
    private router: Router
  ) {

    this.challengeForm = this.fb.group({

      education_program_id: [null, Validators.required],
      department_id: [null, Validators.required],
      education_year_id: [null, Validators.required],

      subject_id: [null, Validators.required],
      challenge_type_id: [null, Validators.required],

      title: ['', [
        Validators.required,
        Validators.maxLength(200)
      ]],

      difficulty: ['easy', Validators.required],

      instructions: ['', [
        Validators.required,
        Validators.maxLength(2000)
      ]],

      challenge_content: this.fb.group({})

    });

  }

  ngOnInit(): void {
    this.loadPrograms();
    this.loadChallengeTypes();
  }

  // ==========================================
  // LOAD EDUCATION PROGRAMS
  // ==========================================

  loadPrograms(): void {

    this.programService.getPrograms().subscribe({

      next: (response: any) => {
        this.programs.set(response.programs || []);
      },

      error: (error) => {
        this.errorMessage =
          error.error?.message ||
          'Failed to load education programs.';
      }

    });

  }

  // ==========================================
  // LOAD DEPARTMENTS
  // ==========================================

  onProgramChange(): void {

    const programId =
      this.challengeForm.get('education_program_id')?.value;

    this.challengeForm.patchValue({
      department_id: null,
      education_year_id: null,
      subject_id: null
    });

    this.departments.set([]);
    this.years.set([]);
    this.subjects.set([]);

    if (!programId) {
      return;
    }

    this.departmentService
      .getDepartmentsByProgram(programId)
      .subscribe({

        next: (response: any) => {
          this.departments.set(response.departments || []);
        },

        error: (error) => {
          this.errorMessage =
            error.error?.message ||
            'Failed to load departments.';
        }

      });

  }

  // ==========================================
  // LOAD EDUCATION YEARS
  // ==========================================

  onDepartmentChange(): void {

    const departmentId =
      this.challengeForm.get('department_id')?.value;

    this.challengeForm.patchValue({
      education_year_id: null,
      subject_id: null
    });

    this.years.set([]);
    this.subjects.set([]);

    if (!departmentId) {
      return;
    }

    this.educationYearService
      .getEducationYearsByDepartment(departmentId)
      .subscribe({

        next: (response: any) => {
          this.years.set(response.years || []);
        },

        error: (error) => {
          this.errorMessage =
            error.error?.message ||
            'Failed to load education years.';
        }

      });

  }

  // ==========================================
  // LOAD SUBJECTS
  // ==========================================

  onYearChange(): void {

    const yearId =
      this.challengeForm.get('education_year_id')?.value;

    this.challengeForm.patchValue({
      subject_id: null
    });

    this.subjects.set([]);

    if (!yearId) {
      return;
    }

    this.subjectService
      .getSubjectsByYear(Number(yearId))
      .subscribe({

        next: (response: any) => {

          const activeSubjects = (response.subjects || [])
            .filter((subject: any) => subject.status === 'active');

          this.subjects.set(activeSubjects);

        },

        error: (error) => {
          this.errorMessage =
            error.error?.message ||
            'Failed to load subjects.';
        }

      });

  }

  // ==========================================
  // LOAD CODING CHALLENGE TYPES
  // ==========================================

  loadChallengeTypes(): void {

    this.challengeService
      .getCodingChallengeTypes()
      .subscribe({

        next: (response: any) => {

          this.challengeTypes.set(
            (response.challengeTypes || [])
              .filter((type: any) => type.status === 'active')
          );

        },

        error: (error) => {
          this.errorMessage =
            error.error?.message ||
            'Failed to load coding challenge types.';
        }

      });

  }

  // ==========================================
  // CHANGE CHALLENGE TYPE
  // ==========================================

  onChallengeTypeChange(): void {

    const typeId =
      this.challengeForm.get('challenge_type_id')?.value;

    this.contentSchema.set([]);

    const contentGroup =
      this.challengeForm.get('challenge_content') as FormGroup;

    Object.keys(contentGroup.controls).forEach(key => {
      contentGroup.removeControl(key);
    });

    if (!typeId) {
      return;
    }

    const selectedType = this.challengeTypes()
      .find(type => type.id === Number(typeId));

    if (!selectedType) {
      return;
    }

    try {

      let schema = selectedType.content_schema;

      if (typeof schema === 'string') {
        schema = JSON.parse(schema);
      }

      if (!Array.isArray(schema)) {
        this.errorMessage = 'Invalid coding challenge type schema.';
        return;
      }

      this.contentSchema.set(schema);

      schema.forEach((field: any) => {

        const validators: any[] = field.required
          ? [Validators.required]
          : [];

        if (field.type === 'number') {
          validators.push(
            Validators.pattern(/^-?\d+(\.\d+)?$/)
          );
        }

        contentGroup.addControl(
          field.key,
          this.fb.control('', validators)
        );

      });

      this.errorMessage = '';

    } catch {

      this.errorMessage =
        'Unable to load the selected coding challenge fields.';

    }

  }

  // ==========================================
  // GET SELECTED TYPE NAME
  // ==========================================

  get selectedTypeName(): string {

    const typeId =
      this.challengeForm.get('challenge_type_id')?.value;

    return this.challengeTypes()
      .find(type => type.id === Number(typeId))?.name || '';

  }

  // ==========================================
  // CREATE CODING CHALLENGE
  // ==========================================

  onSubmit(): void {

    this.message = '';
    this.errorMessage = '';

    if (this.challengeForm.invalid) {

      this.challengeForm.markAllAsTouched();

      this.errorMessage =
        'Please complete all required challenge details.';

      return;
    }

    this.saving.set(true);

    const formValue = this.challengeForm.getRawValue();

    const payload = {

      subject_id: Number(formValue.subject_id),

      challenge_type_id: Number(formValue.challenge_type_id),

      title: formValue.title.trim(),

      difficulty: formValue.difficulty,

      instructions: formValue.instructions.trim(),

      challenge_content: formValue.challenge_content

    };

    this.challengeService
      .createCodingChallenge(payload)
      .subscribe({

        next: (response: any) => {

          this.saving.set(false);

          this.message =
            response.message ||
            'Coding Challenge created successfully.';

          this.challengeForm.reset({
            difficulty: 'easy'
          });

          this.contentSchema.set([]);

          this.departments.set([]);
          this.years.set([]);
          this.subjects.set([]);

        },

        error: (error) => {

          this.saving.set(false);

          this.errorMessage =
            error.error?.message ||
            'Failed to create Coding Challenge.';

        }

      });

  }

  // ==========================================
  // BACK TO CODING CHALLENGE LIST
  // ==========================================

  goBack(): void {
    this.router.navigate([
      '/admin/challenge-arena/coding-challenges'
    ]);
  }

}
