
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  StudentNotesService,
  StudentNotePayload
} from '../../../../../../services/student/advanced/logic-to-code/student-notes.service';

import {
  LogicToCodeService,
  StudentLogicToCodeSubject,
  StudentLogicToCodeProblem
} from '../../../../../../services/student/advanced/logic-to-code/logic-to-code.service';

import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-student-note-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './note-create.html',
  styleUrl: './note-create.css'
})
export class NoteCreate implements OnInit {

  private noteService = inject(StudentNotesService);
  private logicService = inject(LogicToCodeService);
  private toast = inject(ToastService);
  private router = inject(Router);

  title = '';
  note_content = '';

  selectedSubjectId: number | null = null;
  selectedProblemId: number | null = null;

  subjects = signal<StudentLogicToCodeSubject[]>([]);
  problems = signal<StudentLogicToCodeProblem[]>([]);

  loadingSubjects = signal<boolean>(false);
  loadingProblems = signal<boolean>(false);
  loading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadSubjects();
  }

  // =====================================================
  // LOAD DYNAMIC SUBJECTS
  // =====================================================

  loadSubjects(): void {

    this.loadingSubjects.set(true);

    this.logicService.getAvailableSubjects().subscribe({

      next: (response) => {
        this.subjects.set(response.data || []);
        this.loadingSubjects.set(false);
      },

      error: (error) => {
        this.loadingSubjects.set(false);

        this.toast.error(
          error.error?.message || 'Failed to load subjects.'
        );
      }

    });

  }

  // =====================================================
  // LOAD PROBLEMS WHEN SUBJECT CHANGES
  // =====================================================

  onSubjectChange(): void {

    this.selectedProblemId = null;
    this.problems.set([]);

    if (!this.selectedSubjectId) {
      return;
    }

    this.loadingProblems.set(true);

    this.logicService.getProblems(
      '',
      '',
      1,
      50,
      this.selectedSubjectId
    ).subscribe({

      next: (response) => {
        this.problems.set(response.data || []);
        this.loadingProblems.set(false);
      },

      error: (error) => {
        this.loadingProblems.set(false);

        this.toast.error(
          error.error?.message || 'Failed to load problems.'
        );
      }

    });

  }

  // =====================================================
  // CREATE STUDENT NOTE
  // =====================================================

  createNote(): void {

    if (!this.title.trim() || !this.note_content.trim()) {
      this.toast.error('Please enter a note title and note content.');
      return;
    }

   const payload: StudentNotePayload = {
  subject_id: this.selectedSubjectId!,
  problem_id: this.selectedProblemId,
  title: this.title.trim(),
  note_content: this.note_content.trim(),
  note_type: 'other',
  language: null
};

    this.loading.set(true);

    this.noteService.createNote(payload).subscribe({

      next: (response) => {

        this.loading.set(false);

        this.toast.success(
          response.message || 'Note created successfully.'
        );

        this.router.navigate([
          '/student/advanced/logic-to-code/notes'
        ]);

      },

      error: (error) => {

        this.loading.set(false);

        this.toast.error(
          error.error?.message || 'Failed to create note.'
        );

      }

    });

  }

  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    this.router.navigate([
      '/student/advanced/logic-to-code/notes'
    ]);

  }

}
