import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  private notes: string[] = [];
  private notesSubject = new BehaviorSubject<string[]>([]);
  notes$ = this.notesSubject.asObservable();

  sendNoteToStudents(note: string) {
    console.log('Adding note:', note); // Debug log to check note being added
    this.notes.push(note);
    this.notesSubject.next([...this.notes]); // Emit updated copy of the notes array
    console.log('All notes:', this.notes); // Debug log to see current notes
  }
}
