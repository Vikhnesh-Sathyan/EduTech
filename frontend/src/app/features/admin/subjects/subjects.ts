// USE:
// Manages subjects from the admin side.
// Admin can select a program, department and education year,
// create a subject, and view all configured subjects.

import { Component, OnInit } from '@angular/core';

import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import { AdminSubject } from '../../../services/admin-subjects';
import { AdminEducationProgram } from '../../../services/admin-education-program';
import { AdminDepartment } from '../../../services/admin-department';
import { AdminEducationYear } from '../../../services/admin-education-year';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './subjects.html',
  styleUrl: './subjects.css'
})
export class Subjects implements OnInit {

  programs: any[] = [];
  departments: any[] = [];
  years: any[] = [];
  subjects: any[] = [];

  message = '';
  errorMessage = '';

  subjectForm;

  constructor(
    private fb: FormBuilder,
    private subjectService: AdminSubject,
    private adminEducationService: AdminEducationProgram,
    private departmentService: AdminDepartment,
    private educationYearService: AdminEducationYear
  ) {

    this.subjectForm = this.fb.group({

      education_program_id: [
        null,
        Validators.required
      ],

      department_id: [
        null,
        Validators.required
      ],

      education_year_id: [
        null,
        Validators.required
      ],

      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(150)
        ]
      ],

      description: [
        '',
        Validators.maxLength(1000)
      ]

    });

  }

  ngOnInit() {

    this.loadPrograms();
    this.loadSubjects();

  }


  // Load education programs for the first dropdown
  loadPrograms() {

    this.adminEducationService
      .getPrograms()
      .subscribe({

        next: (response: any) => {

          this.programs = response.programs;

        },

        error: (error) => {

          this.errorMessage =
            error.error?.message ||
            'Failed to load education programs.';

        }

      });

  }


  // Load departments when a program is selected
  onProgramChange() {

    const programId =
      this.subjectForm
        .controls
        .education_program_id
        .value;

    this.subjectForm.controls.department_id.setValue(null);
    this.subjectForm.controls.education_year_id.setValue(null);

    this.departments = [];
    this.years = [];

    if (!programId) {
      return;
    }

    this.departmentService
      .getDepartmentsByProgram(programId)
      .subscribe({

        next: (response: any) => {

          this.departments =
            response.departments;

        },

        error: (error) => {

          this.errorMessage =
            error.error?.message ||
            'Failed to load departments.';

        }

      });

  }


  // Load education years when a department is selected
  onDepartmentChange() {

    const departmentId =
      this.subjectForm
        .controls
        .department_id
        .value;

    this.subjectForm.controls.education_year_id
      .setValue(null);

    this.years = [];

    if (!departmentId) {
      return;
    }

    this.educationYearService
      .getEducationYearsByDepartment(departmentId)
      .subscribe({

        next: (response: any) => {

          this.years =
            response.years;

        },

        error: (error) => {

          this.errorMessage =
            error.error?.message ||
            'Failed to load education years.';

        }

      });

  }


  // Load all configured subjects
  loadSubjects() {

    this.subjectService
      .getSubjects()
      .subscribe({

        next: (response: any) => {

          this.subjects =
            response.subjects;

        },

        error: (error) => {

          this.errorMessage =
            error.error?.message ||
            'Failed to load subjects.';

        }

      });

  }


  // Create a subject under the selected education year
  onSubmit() {

    this.message = '';
    this.errorMessage = '';

    if (this.subjectForm.invalid) {

      this.errorMessage =
        'Please complete all subject details.';

      return;

    }

    const {
      education_year_id,
      name,
      description
    } = this.subjectForm.getRawValue();

    this.subjectService
      .createSubject({

        education_year_id: education_year_id!,
        name: name!.trim(),
        description: description?.trim() || ''

      })
      .subscribe({

        next: (response: any) => {

          this.message =
            response.message;

          this.subjectForm.reset();

          this.departments = [];
          this.years = [];

          // Reload subjects after successful creation
          this.loadSubjects();

        },

        error: (error) => {

          this.errorMessage =
            error.error?.message ||
            'Failed to create subject.';

        }

      });

  }

}