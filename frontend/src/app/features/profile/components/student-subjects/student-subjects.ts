// Handles student subject selection

import { Component, OnInit } from '@angular/core';

import { StudentSubject } from '../../../../services/student-subject';

@Component({
  selector: 'app-student-subjects',
  standalone: true,
  templateUrl: './student-subjects.html',
  styleUrl: './student-subjects.css'
})
export class StudentSubjects implements OnInit {

  // Subjects the student can select
  availableSubjects: any[] = [];

  // Subjects already selected by the student
  selectedSubjects: any[] = [];

  message = '';
  errorMessage = '';

  constructor(
    private studentSubjectService: StudentSubject
  ) {}

  // Load subjects when the component opens
  ngOnInit() {
    this.loadSubjects();
  }

  // Load both available and selected subjects
  loadSubjects() {

    this.loadAvailableSubjects();
    this.loadSelectedSubjects();

  }

  // Get subjects available for the student
  loadAvailableSubjects() {

    this.studentSubjectService
      .getAvailableSubjects()
      .subscribe({

        next: (response: any) => {
          this.availableSubjects = response.subjects;
        },

        error: (error) => {
          this.errorMessage =
            error.error?.message ||
            'Failed to load available subjects.';
        }

      });

  }

  // Get subjects already selected by the student
  loadSelectedSubjects() {

    this.studentSubjectService
      .getSelectedSubjects()
      .subscribe({

        next: (response: any) => {
          this.selectedSubjects = response.subjects;
        },

        error: (error) => {
          this.errorMessage =
            error.error?.message ||
            'Failed to load selected subjects.';
        }

      });

  }

  // Select a subject
  selectSubject(subjectId: number) {

    this.message = '';
    this.errorMessage = '';

    this.studentSubjectService
      .selectSubject(subjectId)
      .subscribe({

        next: (response: any) => {

          this.message = response.message;

          // Refresh both lists
          this.loadSubjects();

        },

        error: (error) => {

          this.errorMessage =
            error.error?.message ||
            'Failed to select subject.';

        }

      });

  }

  // Remove a selected subject
  removeSubject(subjectId: number) {

    this.message = '';
    this.errorMessage = '';

    this.studentSubjectService
      .removeSubject(subjectId)
      .subscribe({

        next: (response: any) => {

          this.message = response.message;

          // Refresh both lists
          this.loadSubjects();

        },

        error: (error) => {

          this.errorMessage =
            error.error?.message ||
            'Failed to remove subject.';

        }

      });

  }

}