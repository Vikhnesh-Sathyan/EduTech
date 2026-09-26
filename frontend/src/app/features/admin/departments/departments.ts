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

  onSubmit() {

  // Clear old messages
  this.message = '';
  this.errorMessage = '';

  // Check if the form is valid
  if (this.departmentForm.invalid) {
    this.errorMessage =
      'Please select a program and enter a department name.';
    return;
  }

  // Get form values
  const {
    education_program_id,
    name
  } = this.departmentForm.getRawValue();

  // Send department data to backend
  this.departmentService.createDepartment({
    education_program_id: education_program_id!,
    name: name!.trim()
  }).subscribe({

    // If department is created successfully
    next: (response: any) => {
      this.message = response.message;
      this.departmentForm.reset();

      // Refresh department list
      this.loadDepartments();
    },

    // If API request fails
    error: (error) => {
      this.errorMessage =
        error.error?.message ||
        'Failed to create department.';
    }

  });

}
}