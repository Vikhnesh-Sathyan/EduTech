
import { Component, OnInit } from '@angular/core';
import { StudentSubject } from '../../../../services/student/student-subject';

@Component({
  selector: 'app-student-subjects',
  standalone: true,
  templateUrl: './student-subjects.html',
  styleUrl: './student-subjects.css'
})
export class StudentSubjects implements OnInit {

  availableSubjects: any[] = [];
  selectedSubjects: any[] = [];

  message = '';
  errorMessage = '';

  constructor(
    private studentSubjectService: StudentSubject
  ) {}

  ngOnInit(): void {
    this.loadSubjects();
  }

  // Get the actual subject ID from either API response format.
  getSubjectId(subject: any): number {
    return Number(subject.subject_id ?? subject.id);
  }

  // Remove duplicate entries based on subject ID.
  private uniqueSubjects(subjects: any[]): any[] {
    const seen = new Set<number>();

    return (subjects ?? []).filter(subject => {
      const id = this.getSubjectId(subject);

      if (!Number.isFinite(id) || id <= 0 || seen.has(id)) {
        return false;
      }

      seen.add(id);
      return true;
    });
  }

  // Unique selected subjects.
  get displayedSelectedSubjects(): any[] {
    return this.uniqueSubjects(this.selectedSubjects);
  }

  // Available subjects must not already be selected.
 get displayedAvailableSubjects(): any[] {
  const selectedSubjectNames = new Set(
    this.displayedSelectedSubjects.map(subject =>
      String(subject.name ?? '').trim().toLowerCase()
    )
  );

  return this.uniqueSubjects(this.availableSubjects).filter(
    subject =>
      !selectedSubjectNames.has(
        String(subject.name ?? '').trim().toLowerCase()
      )
  );
}

  loadSubjects(): void {
    this.loadAvailableSubjects();
    this.loadSelectedSubjects();
  }

  loadAvailableSubjects(): void {
    this.studentSubjectService.getAvailableSubjects().subscribe({
      next: (response: any) => {
        this.availableSubjects = response.subjects ?? [];
        console.log('AVAILABLE SUBJECTS:', this.availableSubjects);
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message ||
          'Failed to load available subjects.';
      }
    });
  }

  loadSelectedSubjects(): void {
    this.studentSubjectService.getSelectedSubjects().subscribe({
      next: (response: any) => {
        this.selectedSubjects = response.subjects ?? [];
        console.log('SELECTED SUBJECTS:', this.selectedSubjects);
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message ||
          'Failed to load selected subjects.';
      }
    });
  }

  selectSubject(subjectId: number): void {
    this.message = '';
    this.errorMessage = '';

    const alreadySelected = this.displayedSelectedSubjects.some(
      subject => this.getSubjectId(subject) === Number(subjectId)
    );

    if (alreadySelected) {
      this.errorMessage = 'You have already selected this subject.';
      return;
    }

    this.studentSubjectService.selectSubject(subjectId).subscribe({
      next: (response: any) => {
        this.message =
          response.message || 'Subject selected successfully.';

        this.loadSubjects();
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message ||
          'Failed to select subject.';
      }
    });
  }

  removeSubject(subjectId: number): void {
    this.message = '';
    this.errorMessage = '';

    this.studentSubjectService.removeSubject(subjectId).subscribe({
      next: (response: any) => {
        this.message =
          response.message || 'Subject removed successfully.';

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
