
import { Component, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  MentorTheoryChallengeService
} from '../../../../../services/mentor/challenge-arena/theory/theory-challenge';

@Component({
  selector: 'app-mentor-edit-theory-challenge',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './edit-theory-challenge.html',
  styleUrl: './edit-theory-challenge.css'
})
export class EditTheoryChallenge implements OnInit {

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

  challengeId = 0;
  existingSubjectId = 0;

  challengeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private challengeService: MentorTheoryChallengeService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.challengeForm = this.fb.group({

      education_program_id: [null],
      department_id: [null],
      education_year_id: [null],

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

    this.challengeId = Number(
      this.route.snapshot.paramMap.get('challengeId')
    );

    if (!this.challengeId || isNaN(this.challengeId)) {
      this.goBack();
      return;
    }

    this.loadChallengeAcademics();
    this.loadChallengeTypes();
    this.loadChallenge();

  }

  // ==========================================
  // LOAD MENTOR ACADEMIC GROUPS
  // ==========================================

  loadChallengeAcademics(): void {

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

          // Handle the case where the challenge loaded first.
          if (this.existingSubjectId) {
            this.loadAcademicDetails(this.existingSubjectId);
          }

        },

        error: (error) => {

          this.errorMessage =
            error.error?.message ||
            'Failed to load academic groups.';

        }

      });

  }

  // ==========================================
  // LOAD THEORY CHALLENGE TYPES
  // ==========================================

  loadChallengeTypes(): void {

    this.challengeService
      .getTheoryChallengeTypes()
      .subscribe({

        next: (response: any) => {

          this.challengeTypes.set(response.types || []);

          this.prepareExistingChallengeType();

        },

        error: (error) => {

          this.errorMessage =
            error.error?.message ||
            'Failed to load theory challenge types.';

        }

      });

  }

  // ==========================================
  // LOAD EXISTING THEORY CHALLENGE
  // ==========================================

  loadChallenge(): void {

    this.loading.set(true);

    this.challengeService
      .getTheoryChallengeById(this.challengeId)
      .subscribe({

        next: (response: any) => {

          const challenge = response.challenge;

          if (!challenge) {
            this.errorMessage = 'Theory challenge not found.';
            this.loading.set(false);
            return;
          }

          if (challenge.status !== 'draft') {
            this.errorMessage =
              'Only draft theory challenges can be edited.';
            this.loading.set(false);
            return;
          }

          this.existingSubjectId = Number(challenge.subject_id);

          this.challengeForm.patchValue({

            subject_id: challenge.subject_id,
            challenge_type_id: challenge.challenge_type_id,
            title: challenge.title,
            difficulty: challenge.difficulty,
            instructions: challenge.instructions

          });

          if (this.academics().length) {
            this.loadAcademicDetails(this.existingSubjectId);
          }

          this.buildContentControls(
            challenge.content_schema,
            challenge.challenge_content
          );

          this.loading.set(false);

        },

        error: (error) => {

          this.errorMessage =
            error.error?.message ||
            'Failed to load theory challenge.';

          this.loading.set(false);

        }

      });

  }

  // ==========================================
  // LOAD ACADEMIC DETAILS FOR EXISTING SUBJECT
  // ==========================================

  loadAcademicDetails(subjectId: number): void {

    const selectedAcademic = this.academics().find(item =>
      (item.subjects || []).some(
        (subject: any) => Number(subject.id) === subjectId
      )
    );

    if (!selectedAcademic) {
      return;
    }

    this.challengeForm.patchValue({
      education_program_id: selectedAcademic.program_id
    });

    this.onProgramChange();

    this.challengeForm.patchValue({
      department_id: selectedAcademic.department_id
    });

    this.onDepartmentChange();

    this.challengeForm.patchValue({
      education_year_id: selectedAcademic.education_year_id
    });

    this.onYearChange();

    this.challengeForm.patchValue({
      subject_id: subjectId
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
      .filter(item => Number(item.program_id) === programId);

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
      Number(item.program_id) === programId &&
      Number(item.department_id) === departmentId
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
      Number(item.program_id) === programId &&
      Number(item.department_id) === departmentId &&
      Number(item.education_year_id) === yearId
    );

    this.subjects.set(
      selectedAcademic?.subjects || []
    );

  }

  // ==========================================
  // BUILD EXISTING CONTENT CONTROLS
  // ==========================================

  buildContentControls(
    schemaValue: any,
    contentValue: any
  ): void {

    try {

      let schema = schemaValue;
      let content = contentValue;

      if (typeof schema === 'string') {
        schema = JSON.parse(schema);
      }

      if (typeof content === 'string') {
        content = JSON.parse(content);
      }

      if (!Array.isArray(schema)) {
        this.errorMessage =
          'Invalid theory challenge type schema.';
        return;
      }

      if (!content || typeof content !== 'object' || Array.isArray(content)) {
        content = {};
      }

      this.contentSchema.set(schema);

      const contentGroup =
        this.challengeForm.get('challenge_content') as FormGroup;

      Object.keys(contentGroup.controls).forEach(key => {
        contentGroup.removeControl(key);
      });

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
          this.fb.control(
            content[field.key] ?? '',
            validators
          )
        );

      });

      this.errorMessage = '';

    } catch (error) {

      console.error('Content schema parsing error:', error);

      this.errorMessage =
        'Unable to load the existing theory challenge content.';

    }

  }

  // ==========================================
  // PREPARE EXISTING CHALLENGE TYPE
  // ==========================================

  prepareExistingChallengeType(): void {

    const typeId =
      Number(this.challengeForm.get('challenge_type_id')?.value);

    if (!typeId) {
      return;
    }

    const selectedType = this.challengeTypes()
      .find(type => Number(type.id) === typeId);

    if (!selectedType) {
      return;
    }

    const challengeContent =
      this.challengeForm.get('challenge_content')?.value || {};

    this.buildContentControls(
      selectedType.content_schema,
      challengeContent
    );

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
      .find(type => Number(type.id) === typeId);

    if (!selectedType) {
      return;
    }

    this.buildContentControls(
      selectedType.content_schema,
      {}
    );

  }

  // ==========================================
  // GET SELECTED TYPE NAME
  // ==========================================

  get selectedTypeName(): string {

    const typeId =
      Number(this.challengeForm.get('challenge_type_id')?.value);

    return this.challengeTypes()
      .find(type => Number(type.id) === typeId)?.name || '';

  }

  // ==========================================
  // UPDATE THEORY CHALLENGE
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
      .updateTheoryChallenge(this.challengeId, payload)
      .subscribe({

        next: (response: any) => {

          this.saving.set(false);

          this.message =
            response.message ||
            'Theory Challenge updated successfully.';

          this.router.navigate([
            '/mentor/challenge-arena/theory-challenges'
          ]);

        },

        error: (error) => {

          this.saving.set(false);

          this.errorMessage =
            error.error?.message ||
            'Failed to update Theory Challenge.';

        }

      });

  }

  // ==========================================
  // BACK TO THEORY CHALLENGE LIST
  // ==========================================

  goBack(): void {

    this.router.navigate([
      '/mentor/challenge-arena/theory-challenges'
    ]);

  }

}
