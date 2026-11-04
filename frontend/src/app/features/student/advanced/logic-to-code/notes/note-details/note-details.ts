import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import {
  StudentNotesService,
  StudentNote
} from '../../../../../../services/student/advanced/logic-to-code/student-notes.service';

import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-student-note-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './note-details.html',
  styleUrl: './note-details.css'
})
export class NoteDetails implements OnInit {

  private noteService = inject(StudentNotesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  note = signal<StudentNote | null>(null);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    const noteId = Number(this.route.snapshot.paramMap.get('noteId'));

    if (!Number.isInteger(noteId) || noteId <= 0) {
      this.toast.error('Invalid note ID.');
      this.goBack();
      return;
    }

    this.loadNote(noteId);
  }

  loadNote(noteId: number): void {
    this.loading.set(true);

    this.noteService.getNoteById(noteId).subscribe({
      next: response => {
        this.note.set(response.data);
        this.loading.set(false);
      },
      error: error => {
        console.error('Failed to load note:', error);
        this.loading.set(false);
        this.toast.error(error.error?.message || 'Failed to load note.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/student/advanced/logic-to-code/notes']);
  }

  editNote(): void {
    const currentNote = this.note();

    if (currentNote) {
      this.router.navigate([
        '/student/advanced/logic-to-code/notes',
        currentNote.id,
        'edit'
      ]);
    }
  }
}