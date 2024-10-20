import { Component, OnInit } from '@angular/core';
import { NotesService } from '../notes.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-studytools',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './studytools.component.html',
  styleUrls: ['./studytools.component.css'],
  providers: [NotesService],
})
export class StudytoolsComponent implements OnInit {
  notes: any[] = []; // Holds fetched notes
  selectedClassId: number = 9; // Default class
  noteContent: string = ''; // For new note input

  constructor(private notesService: NotesService) {}

  ngOnInit(): void {
    console.log('Studytools component initialized.');
    this.fetchNotes(); // Fetch notes for the default class on load
  }
  encodeFilePath(filePath: string): string {
    return encodeURIComponent(filePath);
  }
  // Fetch notes based on the selected class
  fetchNotes(): void {
    console.log(`Fetching notes for class: ${this.selectedClassId}`);
    this.notesService.fetchNotesForClass(this.selectedClassId); // Trigger the API call

    // Subscribe to the notes observable to get updated data
    this.notesService.notes$.subscribe({
      next: (notes) => {
        console.log('Notes received:', notes);
        this.notes = notes;
      },
      error: (err) => {
        console.error('Error fetching notes:', err);
        this.notes = []; // Reset notes if fetch fails
      },
    });
  }

  // Send a new note to the selected class
  sendNote(): void {
    if (this.noteContent.trim()) {
      this.notesService.sendNoteToClass(this.noteContent, this.selectedClassId).subscribe({
        next: (response) => {
          console.log('Note sent successfully:', response);
          this.noteContent = ''; // Clear input after sending
          this.fetchNotes(); // Refresh notes
        },
        error: (err) => {
          console.error('Failed to send note:', err);
        },
      });
    } else {
      console.error('Note content is empty');
    }
  }
}
