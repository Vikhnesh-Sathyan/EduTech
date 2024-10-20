import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NotesService } from '../notes.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule} from '@angular/common/http';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, ReactiveFormsModule],
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.css'],
  providers: [NotesService],
})
export class ResourcesComponent implements OnInit {
  noteForm!: FormGroup;
  classes: number[] = [9, 10, 11, 12];
  selectedFile: File | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private notesService: NotesService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.noteForm = this.formBuilder.group({
      selectedClass: ['', Validators.required],
      noteContent: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  onSubmit(): void {
    if (this.noteForm.valid) {
      const { selectedClass, noteContent } = this.noteForm.value;

      const formData = new FormData();
      formData.append('noteContent', noteContent);
      formData.append('classId', selectedClass);

      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      }

      // Send the form data to the backend
      this.http.post('http://localhost:3000/api/notes', formData).subscribe({
        next: (response) => {
          console.log('Note sent successfully:', response);
          this.noteForm.reset();
          this.selectedFile = null;
        },
        error: (err) => {
          console.error('Error sending note:', err);
          alert('Failed to send note. Please try again.');
        },
      });
    } else {
      console.warn('Form is invalid. Please check your input.');
    }
  }
}
