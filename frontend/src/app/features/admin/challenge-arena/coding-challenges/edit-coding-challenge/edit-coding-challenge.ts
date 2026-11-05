
import { Component, OnInit, signal } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { AdminSubject } from '../../../../../services/admin/admin-subjects';
import { AdminEducationProgram } from '../../../../../services/admin/admin-education-program';
import { AdminDepartment } from '../../../../../services/admin/admin-department';
import { AdminEducationYear } from '../../../../../services/admin/admin-education-year';

import { CodingChallengeService } from '../../../../../services/admin/challenge-arena/coding/coding-challenge';

@Component({
  selector: 'app-edit-coding-challenge',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './edit-coding-challenge.html',
  styleUrl: './edit-coding-challenge.css'
})
export class EditCodingChallenge implements OnInit {

  private challengeId!: number;

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
    private route: ActivatedRoute,
    private router: Router,
    private subjectService: AdminSubject,
    private programService: AdminEducationProgram,
    private departmentService: AdminDepartment,
    private educationYearService: AdminEducationYear,
    private challengeService: CodingChallengeService
  ) {

    this.challengeForm = this.fb.group({

      education_program_id: [null, Validators.required],
      department_id: [null, Validators.required],
      education_year_id: [null, Validators.required],
      subject_id: [null, Validators.required],

      challenge_type_id: [null, Validators.required],

      title: [
        '',
        [Validators.required, Validators.maxLength(200)]
      ],

      difficulty: ['easy', Validators.required],

      instructions: [
        '',
        [Validators.required, Validators.maxLength(2000)]
      ],

      challenge_content: this.fb.group({})

    });

  }

  // ==========================================
  // INITIALIZE COMPONENT
  // ==========================================

  ngOnInit(): void {

    this.challengeId = Number(
      this.route.snapshot.paramMap.get('challengeId')
    );

    if (!this.challengeId || isNaN(this.challengeId)) {
      this.goBack();
      return;
    }

    this.loading.set(true);

    // Load programs first to avoid academic restoration race.
    this.programService.getPrograms().subscribe({

      next: (response: any) => {

        this.programs.set(response.programs || []);

        this.loadChallengeTypes();
        this.loadChallenge();

      },

      error: (error) => {

        this.errorMessage =
          error.error?.message ||
          'Failed to load education programs.';

        this.loading.set(false);

      }

    });

  }

  // ==========================================
  // PROGRAM CHANGE
  // ==========================================

  onProgramChange(): void {

    const programId = Number(
      this.challengeForm.get('education_program_id')?.value
    );

    this.challengeForm.patchValue({
      department_id: null,
      education_year_id: null,
      subject_id: null
    });

    this.departments.set([]);
    this.years.set([]);
    this.subjects.set([]);

    if (!programId) return;

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
  // DEPARTMENT CHANGE
  // ==========================================

  onDepartmentChange(): void {

    const departmentId = Number(
      this.challengeForm.get('department_id')?.value
    );

    this.challengeForm.patchValue({
      education_year_id: null,
      subject_id: null
    });

    this.years.set([]);
    this.subjects.set([]);

    if (!departmentId) return;

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
  // EDUCATION YEAR CHANGE
  // ==========================================

  onYearChange(): void {

    const yearId = Number(
      this.challengeForm.get('education_year_id')?.value
    );

    this.challengeForm.patchValue({
      subject_id: null
    });

    this.subjects.set([]);

    if (!yearId) return;

    this.subjectService
      .getSubjectsByYear(yearId)
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
  // CHALLENGE TYPE CHANGE
  // ==========================================

  onChallengeTypeChange(): void {

    const typeId = Number(
      this.challengeForm.get('challenge_type_id')?.value
    );

    const selectedType = this.challengeTypes().find(
      type => Number(type.id) === typeId
    );

    if (!selectedType) {

      this.contentSchema.set([]);

      this.challengeForm.setControl(
        'challenge_content',
        this.fb.group({})
      );

      return;

    }

    const schema = this.parseJson(
      selectedType.content_schema
    );

    this.contentSchema.set(
      Array.isArray(schema) ? schema : []
    );

    this.createContentControls(
      this.contentSchema(),
      {}
    );

  }

  // ==========================================
  // LOAD EXISTING CODING CHALLENGE
  // ==========================================

  loadChallenge(): void {

    this.challengeService
      .getCodingChallengeById(this.challengeId)
      .subscribe({

        next: (response: any) => {

          const challenge = response.challenge;

          if (!challenge) {

            this.errorMessage =
              'Coding challenge not found.';

            this.loading.set(false);

            return;

          }

          this.challengeForm.patchValue({

            challenge_type_id: challenge.challenge_type_id,
            title: challenge.title,
            difficulty: challenge.difficulty,
            instructions: challenge.instructions

          });

          const schema = this.parseJson(
            challenge.content_schema
          );

          const content = this.parseJson(
            challenge.challenge_content
          );

          this.contentSchema.set(
            Array.isArray(schema) ? schema : []
          );

          this.createContentControls(
            this.contentSchema(),
            content || {}
          );

          this.loadAcademicDetails(
            Number(challenge.subject_id)
          );

        },

        error: (error) => {

          console.error(
            'Error loading coding challenge:',
            error
          );

          this.errorMessage =
            error.error?.message ||
            'Failed to load coding challenge.';

          this.loading.set(false);

        }

      });

  }

  // ==========================================
  // PARSE JSON DATA
  // ==========================================

  private parseJson(value: any): any {

    if (typeof value !== 'string') {
      return value;
    }

    try {
      return JSON.parse(value);
    } catch {
      return null;
    }

  }

  // ==========================================
  // CREATE DYNAMIC CONTENT CONTROLS
  // ==========================================

  private createContentControls(
    schema: any[],
    content: any
  ): void {

    const controls: any = {};

    schema.forEach((field: any) => {

      const validators = [];

      if (field.required) {
        validators.push(Validators.required);
      }

      if (field.type === 'number') {
        validators.push(
          Validators.pattern(/^-?\d+(\.\d+)?$/)
        );
      }

      controls[field.key] = [
        content[field.key] ?? '',
        validators
      ];

    });

    this.challengeForm.setControl(
      'challenge_content',
      this.fb.group(controls)
    );

  }

  // ==========================================
  // RESTORE ACADEMIC DETAILS
  // ==========================================

  loadAcademicDetails(subjectId: number): void {

    this.subjectService.getSubjects().subscribe({

      next: (subjectResponse: any) => {

        const subject = (subjectResponse.subjects || [])
          .find(
            (item: any) =>
              Number(item.id) === subjectId
          );

        if (!subject) {

          this.errorMessage = 'Subject details not found.';
          this.loading.set(false);

          return;

        }

        const selectedProgram = this.programs().find(
          (item: any) =>
            item.name === subject.program_name
        );

        if (!selectedProgram) {

          this.errorMessage = 'Education program not found.';
          this.loading.set(false);

          return;

        }

        this.challengeForm.patchValue({
          education_program_id: selectedProgram.id
        });

        this.departmentService
          .getDepartmentsByProgram(selectedProgram.id)
          .subscribe({

            next: (departmentResponse: any) => {

              const departments =
                departmentResponse.departments || [];

              this.departments.set(departments);

              const selectedDepartment = departments.find(
                (item: any) =>
                  item.name === subject.department_name
              );

              if (!selectedDepartment) {

                this.errorMessage = 'Department not found.';
                this.loading.set(false);

                return;

              }

              this.challengeForm.patchValue({
                department_id: selectedDepartment.id
              });

              this.educationYearService
                .getEducationYearsByDepartment(
                  selectedDepartment.id
                )
                .subscribe({

                  next: (yearResponse: any) => {

                    const years = yearResponse.years || [];

                    this.years.set(years);

                    const selectedYear = years.find(
                      (item: any) =>
                        Number(item.id) ===
                        Number(subject.education_year_id)
                    );

                    if (!selectedYear) {

                      this.errorMessage =
                        'Education year not found.';

                      this.loading.set(false);

                      return;

                    }

                    this.challengeForm.patchValue({
                      education_year_id: selectedYear.id
                    });

                    this.subjectService
                      .getSubjectsByYear(selectedYear.id)
                      .subscribe({

                        next: (subjectListResponse: any) => {

                          const activeSubjects =
                            (subjectListResponse.subjects || [])
                              .filter(
                                (item: any) =>
                                  item.status === 'active'
                              );

                          this.subjects.set(activeSubjects);

                          this.challengeForm.patchValue({
                            subject_id: subjectId
                          });

                          this.loading.set(false);

                        },

                        error: (error) => {

                          this.errorMessage =
                            error.error?.message ||
                            'Failed to load subjects.';

                          this.loading.set(false);

                        }

                      });

                  },

                  error: (error) => {

                    this.errorMessage =
                      error.error?.message ||
                      'Failed to load education years.';

                    this.loading.set(false);

                  }

                });

            },

            error: (error) => {

              this.errorMessage =
                error.error?.message ||
                'Failed to load departments.';

              this.loading.set(false);

            }

          });

      },

      error: (error) => {

        this.errorMessage =
          error.error?.message ||
          'Failed to load subject details.';

        this.loading.set(false);

      }

    });

  }

  // ==========================================
  // SAVE CHANGES
  // ==========================================

  onSubmit(): void {

    this.message = '';
    this.errorMessage = '';

    if (this.challengeForm.invalid) {

      this.challengeForm.markAllAsTouched();

      this.errorMessage =
        'Please complete all required fields.';

      return;

    }

    this.saving.set(true);

    const formValue = this.challengeForm.getRawValue();

    const updateData = {

      subject_id: Number(formValue.subject_id),

      challenge_type_id: Number(formValue.challenge_type_id),

      title: formValue.title.trim(),

      difficulty: formValue.difficulty,

      instructions: formValue.instructions.trim(),

      challenge_content: formValue.challenge_content

    };

    this.challengeService
      .updateCodingChallenge(this.challengeId, updateData)
      .subscribe({

        next: (response: any) => {

          this.saving.set(false);

          this.message =
            response.message ||
            'Coding Challenge updated successfully.';

          this.router.navigate([
            '/admin/challenge-arena/coding-challenges'
          ]);

        },

        error: (error) => {

          console.error(
            'Coding challenge update failed:',
            error
          );

          this.errorMessage =
            error.error?.message ||
            'Failed to update coding challenge.';

          this.saving.set(false);

        }

      });

  }

  // ==========================================
  // GO BACK
  // ==========================================

  goBack(): void {

    this.router.navigate([
      '/admin/challenge-arena/coding-challenges'
    ]);

  }

}
