// USE:
// Controls the Admin Education Programs page.
// It loads programs from the backend and manages the page state
// for viewing, creating, editing, and activating/deactivating programs.

import { Component, OnInit , ChangeDetectorRef} from '@angular/core';

import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import { AdminEducationProgram } from '../../../services/admin-education-program';

@Component({
  selector: 'app-education-programs',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './education-programs.html',
  styleUrl: './education-programs.css'
})
export class EducationPrograms implements OnInit {

  programs: any[] = [];

  message = '';
  errorMessage = '';

  editMode = false;
  editingProgramId: number | null = null;

  programForm;

  constructor(
    private fb: FormBuilder,
    private programService: AdminEducationProgram,
    private cdr: ChangeDetectorRef
  ) {
    this.programForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }


 ngOnInit() {

  console.log('EDUCATION PROGRAMS COMPONENT CREATED');

  this.loadPrograms();

}

  // Load all education programs from the backend
loadPrograms() {

  this.programService.getPrograms().subscribe({

    next: (response: any) => {


      this.programs = response.programs;
      
      this.cdr.detectChanges();


    },

    error: (error) => {

      this.errorMessage =
        error.error?.message ||
        'Failed to load education programs.';

    }

  });
}

  // Submit the form to create or update a program
  onSubmit() {

    this.message = '';
    this.errorMessage = '';

    if (this.programForm.invalid) {
      this.errorMessage =
        'Please enter the program name.';
      return;
    }

    const formData = this.programForm.getRawValue();

    const data = {
      name: formData.name!,
      description: formData.description || ''
    };

    // Update existing program
    if (this.editMode && this.editingProgramId !== null) {

      this.programService.updateProgram(
        this.editingProgramId,
        data
      ).subscribe({

        next: (response: any) => {

          this.message = response.message;

          this.resetForm();

          this.loadPrograms();
        },

        error: (error) => {
          this.errorMessage =
            error.error?.message ||
            'Failed to update education program.';
        }

      });

      return;
    }

    // Create new program
    this.programService.createProgram(data).subscribe({

      next: (response: any) => {

        this.message = response.message;

        this.resetForm();

        this.loadPrograms();
      },

      error: (error) => {
        this.errorMessage =
          error.error?.message ||
          'Failed to create education program.';
      }

    });
  }

  // Put a program into edit mode
  editProgram(program: any) {

    this.message = '';
    this.errorMessage = '';

    this.editMode = true;
    this.editingProgramId = program.id;

    this.programForm.patchValue({
      name: program.name,
      description: program.description || ''
    });
  }

  // Change a program between active and inactive
  toggleProgramStatus(program: any) {

    this.message = '';
    this.errorMessage = '';

    const newStatus =
      program.status === 'active'
        ? 'inactive'
        : 'active';

    this.programService.updateProgramStatus(
      program.id,
      newStatus
    ).subscribe({

      next: (response: any) => {

        this.message = response.message;

        this.loadPrograms();
      },

      error: (error) => {
        this.errorMessage =
          error.error?.message ||
          'Failed to update program status.';
      }

    });
  }

  // Exit edit mode and clear the form
  resetForm() {

    this.editMode = false;
    this.editingProgramId = null;

    this.programForm.reset({
      name: '',
      description: ''
    });
  }
}