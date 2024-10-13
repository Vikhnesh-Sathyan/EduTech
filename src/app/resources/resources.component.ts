import { Component } from '@angular/core';
import { NotesService } from '../notes.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.css'],
})
export class ResourcesComponent {
  noteContent: string = '';

  constructor(private notesService: NotesService) {}

  sendNote() {
    if (this.noteContent.trim()) {
      this.notesService.sendNoteToStudents(this.noteContent);
      console.log('Note sent:', this.noteContent); // Debug log to confirm note sent
      this.noteContent = ''; // Clear input after sending
    } else {
      console.log('Empty note, not sending.'); // Debug log for empty input
    }
  }
}
