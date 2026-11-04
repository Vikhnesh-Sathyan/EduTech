
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import {
  StudentNotesService,
  StudentNote
} from '../../../../../../services/student/advanced/logic-to-code/student-notes.service';

import { ToastService } from '../../../../../../services/toast.service';

import { ConfirmModalComponent } from '../../../../../../shared/confirm-modal/confirm-modal';

@Component({
  selector: 'app-student-note-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmModalComponent],
  templateUrl: './note-list.html',
  styleUrl: './note-list.css' 
})
export class NoteList implements OnInit {

  private noteService = inject(StudentNotesService);
  private toast = inject(ToastService);

  notes = signal<StudentNote[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');
  deletingNoteId = signal<number | null>(null);
  showDeleteModal = signal<boolean>(false);
selectedNoteId = signal<number | null>(null);

  ngOnInit(): void {
    this.loadNotes();
  }

  // =====================================================
  // LOAD STUDENT NOTES
  // =====================================================

  loadNotes(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.noteService.getNotes().subscribe({

      next: (response) => {

        this.notes.set(response.data || []);
        this.loading.set(false);

      },

      error: (error) => {

        console.error('Failed to load notes:', error);

        this.errorMessage.set(
          error.error?.message || 'Failed to load your notes.'
        );

        this.loading.set(false);

      }

    });

  }

  // =====================================================
  // GET NOTE TYPE CLASS
  // =====================================================

  getNoteTypeClass(type: string): string {

    return `note-type-${type}`;

  }

  togglePin(note: StudentNote): void {

  this.noteService.togglePin(note.id).subscribe({

    next: response => {

      this.toast.success(
        response.message || 'Note pin status updated.'
      );

      this.loadNotes();

    },

    error: error => {

      console.error('Failed to update pin status:', error);

      this.toast.error(
        error.error?.message || 'Failed to update pin status.'
      );

    }

  });

}

  // =====================================================
  // GET PIN STATUS
  // =====================================================

  isPinned(note: StudentNote): boolean {

    return Boolean(note.is_pinned);

  }

  // =====================================================
// OPEN DELETE CONFIRMATION
// =====================================================

requestDelete(note: StudentNote): void {
  this.selectedNoteId.set(note.id);
  this.showDeleteModal.set(true);
}

// =====================================================
// CANCEL DELETE
// =====================================================

cancelDelete(): void {
  this.showDeleteModal.set(false);
  this.selectedNoteId.set(null);
}

// =====================================================
// CONFIRM DELETE
// =====================================================

confirmDelete(): void {
  const noteId = this.selectedNoteId();

  if (!noteId) {
    return;
  }

  this.deletingNoteId.set(noteId);

  this.noteService.deleteNote(noteId).subscribe({

    next: response => {

      this.deletingNoteId.set(null);
      this.showDeleteModal.set(false);
      this.selectedNoteId.set(null);

      this.toast.success(
        response.message || 'Note deleted successfully.'
      );

      this.loadNotes();

    },

    error: error => {

      this.deletingNoteId.set(null);

      console.error('Failed to delete note:', error);

      this.toast.error(
        error.error?.message || 'Failed to delete note.'
      );

    }

  });
}

}
