// USE:
// Manages education departments from the admin side.
// Admin can select an education program to create a department
// and view all configured departments.

import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import { AdminDepartment } from '../../../services/admin-department';
import { AdminEducationProgram } from '../../../services/admin-education-program';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './departments.html',
  styleUrl: './departments.css'
})
export class Departments implements OnInit {

  // List of departments, shown in the table/list
  departments = signal<any[]>([]);

  // List of programs, used for the dropdown
  programs = signal<any[]>([]);

  message = '';
  errorMessage = '';

  departmentForm;

  constructor(
    private fb: FormBuilder,
    private departmentService: AdminDepartment,
    private adminEducationService: AdminEducationProgram,
  ) {

    this.departmentForm = this.fb.group({

      education_program_id: [
        null,
        Validators.required
      ],

      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(150)
        ]
      ]

    });

  }

  ngOnInit() {
    this.loadPrograms();
    this.loadDepartments();
  }

  // Load all configured departments
  loadDepartments() {

    this.departmentService.getDepartments().subscribe({

      next: (response: any) => {
        this.departments.set(response.departments);
      },

      error: (error) => {
        this.errorMessage =
          error.error?.message ||
          'Failed to load departments.';
      }

    });

  }

  // Load active education programs for the department dropdown
  loadPrograms() {

    this.adminEducationService.getPrograms().subscribe({

      next: (response: any) => {
        this.programs.set(response.programs);
      },

      error: (error) => {
        this.errorMessage =
          error.error?.message ||
          'Failed to load education programs.';
      }

    });

  }

  // Create a department under the selected education program
  onSubmit() {

    this.message = '';
    this.errorMessage = '';

    if (this.departmentForm.invalid) {
      this.errorMessage =
        'Please select a program and enter a department name.';
      return;
    }

    const {
      education_program_id,
      name
    } = this.departmentForm.getRawValue();

    this.departmentService.createDepartment({
      education_program_id: education_program_id!,
      name: name!.trim()
    }).subscribe({

      next: (response: any) => {
        this.message = response.message;
        this.departmentForm.reset();
        this.loadDepartments();   // reload list after successful creation
      },

      error: (error) => {
        this.errorMessage =
          error.error?.message ||
          'Failed to create department.';
      }

    });

  }

}