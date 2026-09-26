// USE:
// Manages education years from the admin side.
// Admin can select an education program and department,
// create an education year, and view all configured years.

import { Component, OnInit, signal } from '@angular/core';

import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import { AdminEducationYear } from '../../../services/admin-education-year';
import { AdminEducationProgram } from '../../../services/admin-education-program';
import { AdminDepartment } from '../../../services/admin-department';

@Component({
  selector: 'app-education-years',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './education-years.html',
  styleUrl: './education-years.css'
})
export class EducationYears implements OnInit {

  programs: any[] = [];
  departments: any[] = [];
  years = signal<any[]>([]);

  message = '';
  errorMessage = '';

  educationYearForm;

  constructor(
    private fb: FormBuilder,
    private educationYearService: AdminEducationYear,
    private adminEducationService: AdminEducationProgram,
    private departmentService: AdminDepartment
  ) {

    this.educationYearForm = this.fb.group({

      education_program_id: [
        null,
        Validators.required
      ],

      department_id: [
        null,
        Validators.required
      ],

      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],

      year_order: [
        null,
        [
          Validators.required,
          Validators.min(1)
        ]
      ]

    });

  }

  ngOnInit() {

    this.loadPrograms();
    this.loadEducationYears();

  }

  // Load education programs for the dropdown
  loadPrograms() {

    this.adminEducationService.getPrograms().subscribe({

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

  // Load departments when an education program is selected
  onProgramChange() {

    const programId =
      this.educationYearForm.controls.education_program_id.value;

    this.educationYearForm.controls.department_id.setValue(null);

    this.departments = [];

    if (!programId) {
      return;
    }

    this.departmentService
      .getDepartmentsByProgram(programId)
      .subscribe({

        next: (response: any) => {

          this.departments = response.departments;

        },

        error: (error) => {

          this.errorMessage =
            error.error?.message ||
            'Failed to load departments.';

        }

      });

  }

  // Load all configured education years
  loadEducationYears() {

    this.educationYearService
      .getEducationYears()
      .subscribe({

        next: (response: any) => {

          this.years.set(response.years);

        },

        error: (error) => {

          this.errorMessage =
            error.error?.message ||
            'Failed to load education years.';

        }

      });

  }

  // Create an education year under the selected department
  onSubmit() {

    this.message = '';
    this.errorMessage = '';

    if (this.educationYearForm.invalid) {

      this.errorMessage =
        'Please complete all education year details.';

      return;

    }

    const {
      department_id,
      name,
      year_order
    } = this.educationYearForm.getRawValue();

    this.educationYearService
      .createEducationYear({

        department_id: department_id!,
        name: name!.trim(),
        year_order: year_order!

      })
      .subscribe({

        next: (response: any) => {

          this.message = response.message;

          this.educationYearForm.reset();

          this.departments = [];

          // Reload education years after successful creation
          this.loadEducationYears();

        },

        error: (error) => {

          this.errorMessage =
            error.error?.message ||
            'Failed to create education year.';

        }

      });

  }

}