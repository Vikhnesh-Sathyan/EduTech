
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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
  selector: 'app-student-note-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './note-edit.html',
  styleUrl: './note-edit.css'
})
export class NoteEdit implements OnInit {

  private noteService = inject(StudentNotesService);
  private logicService = inject(LogicToCodeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  noteId = 0;

  title = '';
  note_content = '';

  selectedSubjectId: number | null = null;
  selectedProblemId: number | null = null;

  subjects = signal<StudentLogicToCodeSubject[]>([]);
  problems = signal<StudentLogicToCodeProblem[]>([]);

  loading = signal<boolean>(true);
  loadingSubjects = signal<boolean>(false);
  loadingProblems = signal<boolean>(false);
  saving = signal<boolean>(false);

  ngOnInit(): void {

    this.noteId = Number(this.route.snapshot.paramMap.get('noteId'));

    if (!Number.isInteger(this.noteId) || this.noteId <= 0) {
      this.toast.error('Invalid note ID.');
      this.goBack();
      return;
    }

    this.loadSubjects();
    this.loadNote();

  }


  // =====================================================
  // LOAD AVAILABLE SUBJECTS
  // =====================================================

  loadSubjects(): void {

    this.loadingSubjects.set(true);

    this.logicService.getAvailableSubjects().subscribe({

      next: response => {

        this.subjects.set(response.data || []);
        this.loadingSubjects.set(false);

      },

      error: error => {

        this.loadingSubjects.set(false);

        this.toast.error(
          error.error?.message || 'Failed to load subjects.'
        );

      }

    });

  }


  // =====================================================
  // LOAD NOTE DETAILS
  // =====================================================

  loadNote(): void {

    this.noteService.getNoteById(this.noteId).subscribe({

      next: response => {

        const note = response.data;

        this.title = note.title;
        this.note_content = note.note_content;

        this.selectedSubjectId = note.subject_id;
        this.selectedProblemId = note.problem_id;

        this.loading.set(false);

        // Load problems for the existing subject
        if (this.selectedSubjectId) {
          this.loadProblems(false);
        }

      },

      error: error => {

        this.loading.set(false);

        this.toast.error(
          error.error?.message || 'Failed to load note.'
        );

      }

    });

  }


  // =====================================================
  // SUBJECT CHANGE
  // =====================================================

  onSubjectChange(): void {

    // Clear previous problem when subject changes
    this.selectedProblemId = null;

    this.problems.set([]);

    if (!this.selectedSubjectId) {
      return;
    }

    this.loadProblems();

  }


  // =====================================================
  // LOAD PROBLEMS FOR SELECTED SUBJECT
  // =====================================================

  loadProblems(clearSelection: boolean = true): void {

    if (!this.selectedSubjectId) {
      return;
    }

    if (clearSelection) {
      this.selectedProblemId = null;
    }

    this.loadingProblems.set(true);

    this.logicService.getProblems(
      '',
      '',
      1,
      50,
      this.selectedSubjectId
    ).subscribe({

      next: response => {

        this.problems.set(response.data || []);
        this.loadingProblems.set(false);

      },

      error: error => {

        this.loadingProblems.set(false);

        this.toast.error(
          error.error?.message || 'Failed to load problems.'
        );

      }

    });

  }


  // =====================================================
  // UPDATE NOTE
  // =====================================================

  updateNote(): void {

    if (!this.selectedSubjectId) {

      this.toast.error('Please select a subject.');
      return;

    }

    if (!this.title.trim() || !this.note_content.trim()) {

      this.toast.error('Please enter a note title and content.');
      return;

    }

    const payload: Partial<StudentNotePayload> = {

      subject_id: this.selectedSubjectId,

      problem_id: this.selectedProblemId,

      title: this.title.trim(),

      note_content: this.note_content.trim()

    };

    this.saving.set(true);

    this.noteService.updateNote(this.noteId, payload).subscribe({

      next: response => {

        this.saving.set(false);

        this.toast.success(
          response.message || 'Note updated successfully.'
        );

        this.router.navigate([
          '/student/advanced/logic-to-code/notes',
          this.noteId
        ]);

      },

      error: error => {

        this.saving.set(false);

        this.toast.error(
          error.error?.message || 'Failed to update note.'
        );

      }

    });

  }


  // =====================================================
  // GO BACK
  // =====================================================

  goBack(): void {

    this.router.navigate([
      '/student/advanced/logic-to-code/notes',
      this.noteId
    ]);

  }

}
