import { Component, OnInit } from '@angular/core';
import { NotesService } from '../notes.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-studytools',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './studytools.component.html',
  styleUrls: ['./studytools.component.css'],
})
export class StudytoolsComponent implements OnInit {
  notes: string[] = [];

  constructor(private notesService: NotesService) {}

  ngOnInit() {
    this.notesService.notes$.subscribe((notes) => {
      console.log('Notes received in StudyTools:', notes); // Debug log to see notes
      this.notes = notes; // Update local notes array
    });
  }
}
