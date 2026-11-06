
import { Component, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  MentorCodingChallengeService
} from '../../../../../services/mentor/challenge-arena/coding/coding-challenge';

@Component({
  selector: 'app-mentor-create-coding-challenge',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './create-coding-challenge.html',
  styleUrl: './create-coding-challenge.css'
})
export class CreateCodingChallenge implements OnInit {

  academics = signal<any[]>([]);

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
    private challengeService: MentorCodingChallengeService,
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
    this.loadChallengeAcademics();
    this.loadChallengeTypes();
  }

  // ==========================================
  // LOAD MENTOR ACADEMIC GROUPS
  // ==========================================

  loadChallengeAcademics(): void {

    this.loading.set(true);

    this.challengeService
      .getChallengeAcademics()
      .subscribe({

        next: (response: any) => {

          const academics = response.academics || [];

          this.academics.set(academics);

          const uniquePrograms = new Map();

          academics.forEach((item: any) => {
            uniquePrograms.set(item.program_id, {
              id: item.program_id,
              name: item.program_name
            });
          });

          this.programs.set(
            Array.from(uniquePrograms.values())
          );

          this.loading.set(false);

        },

        error: (error) => {

          this.errorMessage =
            error.error?.message ||
            'Failed to load academic groups.';

          this.loading.set(false);

        }

      });

  }

  // ==========================================
  // PROGRAM CHANGE
  // ==========================================

  onProgramChange(): void {

    const programId =
      Number(this.challengeForm.get('education_program_id')?.value);

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

    const filtered = this.academics()
      .filter(item => item.program_id === programId);

    const uniqueDepartments = new Map();

    filtered.forEach(item => {
      uniqueDepartments.set(item.department_id, {
        id: item.department_id,
        name: item.department_name
      });
    });

    this.departments.set(
      Array.from(uniqueDepartments.values())
    );

  }

  // ==========================================
  // DEPARTMENT CHANGE
  // ==========================================

  onDepartmentChange(): void {

    const programId =
      Number(this.challengeForm.get('education_program_id')?.value);

    const departmentId =
      Number(this.challengeForm.get('department_id')?.value);

    this.challengeForm.patchValue({
      education_year_id: null,
      subject_id: null
    });

    this.years.set([]);
    this.subjects.set([]);

    if (!programId || !departmentId) {
      return;
    }

    const filtered = this.academics().filter(item =>
      item.program_id === programId &&
      item.department_id === departmentId
    );

    const uniqueYears = new Map();

    filtered.forEach(item => {
      uniqueYears.set(item.education_year_id, {
        id: item.education_year_id,
        name: item.year_name
      });
    });

    this.years.set(
      Array.from(uniqueYears.values())
    );

  }

  // ==========================================
  // EDUCATION YEAR CHANGE
  // ==========================================

  onYearChange(): void {

    const programId =
      Number(this.challengeForm.get('education_program_id')?.value);

    const departmentId =
      Number(this.challengeForm.get('department_id')?.value);

    const yearId =
      Number(this.challengeForm.get('education_year_id')?.value);

    this.challengeForm.patchValue({
      subject_id: null
    });

    this.subjects.set([]);

    if (!programId || !departmentId || !yearId) {
      return;
    }

    const selectedAcademic = this.academics().find(item =>
      item.program_id === programId &&
      item.department_id === departmentId &&
      item.education_year_id === yearId
    );

    this.subjects.set(
      selectedAcademic?.subjects || []
    );

  }

  // ==========================================
  // LOAD CHALLENGE TYPES
  // ==========================================

  loadChallengeTypes(): void {

    this.challengeService
      .getCodingChallengeTypes()
      .subscribe({

        next: (response: any) => {

          console.log('CODING CHALLENGE TYPES:', response);

          this.challengeTypes.set(response.types || []);

        },

        error: (error) => {

          console.error('Failed to load challenge types:', error);

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
      Number(this.challengeForm.get('challenge_type_id')?.value);

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
      .find(type => type.id === typeId);

    if (!selectedType) {
      return;
    }

    try {

      let schema = selectedType.content_schema;

      if (typeof schema === 'string') {
        schema = JSON.parse(schema);
      }

      if (!Array.isArray(schema)) {
        this.errorMessage =
          'Invalid coding challenge type schema.';
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
      Number(this.challengeForm.get('challenge_type_id')?.value);

    return this.challengeTypes()
      .find(type => type.id === typeId)?.name || '';

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
            'Coding challenge created successfully.';

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
      '/mentor/challenge-arena/coding-challenges'
    ]);

  }

}
