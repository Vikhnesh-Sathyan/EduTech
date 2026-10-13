import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Study } from '../../../../../services/student/study';

@Component({
  selector: 'app-resource-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resource-form.html',
  styleUrl: './resource-form.css'
})
export class ResourceFormComponent implements OnInit {

  @Output() formSubmit = new EventEmitter<FormData>();
  @Output() formCancel = new EventEmitter<void>();

  // Form values
  title = signal('');
  subjectId = signal('');
  resourceType = signal('notes');
  description = signal('');
  resourceUrl = signal('');
  resourceContent = signal('');

  // File selection and messages
  selectedFile = signal<File | null>(null);
  errorMessage = signal('');

  // Available subjects
  subjects = signal<any[]>([]);

  // Available resource types
  resourceTypes = [
    { label: 'Notes', value: 'notes' },
    { label: 'PDF', value: 'pdf' },
    { label: 'Video', value: 'video' },
    { label: 'Image', value: 'image' },
    { label: 'Study Tips', value: 'study_tips' }
  ];

  constructor(private readonly studyService: Study) {}

  ngOnInit(): void {
    this.loadSubjects();
  }

  // Load subjects from the existing API.
  loadSubjects(): void {
    this.studyService.getSubjects().subscribe({
      next: (response: any) => {
        const subjects = Array.isArray(response)
          ? response
          : response?.subjects ?? response?.data ?? [];

        this.subjects.set(subjects);
      },

      error: (error) => {
        console.error('Failed to load subjects:', error);

        this.errorMessage.set(
          'Unable to load subjects. Please try again.'
        );
      }
    });
  }

  // Store the selected file in a signal.
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.selectedFile.set(input.files?.[0] ?? null);
  }

  // Validate the form and emit FormData to the parent component.
  submitForm(): void {
    this.errorMessage.set('');

    const title = this.title().trim();
    const subjectId = this.subjectId();
    const resourceType = this.resourceType();
    const description = this.description().trim();
    const resourceUrl = this.resourceUrl().trim();
    const resourceContent = this.resourceContent().trim();
    const selectedFile = this.selectedFile();

    if (!title || !subjectId) {
      this.errorMessage.set(
        'Please enter a title and select a subject.'
      );
      return;
    }

    if (
      (resourceType === 'pdf' || resourceType === 'image') &&
      !selectedFile
    ) {
      this.errorMessage.set('Please select a file to upload.');
      return;
    }

    if (resourceType === 'video' && !resourceUrl) {
      this.errorMessage.set('Please enter the video URL.');
      return;
    }

    if (
      (resourceType === 'notes' ||
        resourceType === 'study_tips') &&
      !resourceContent
    ) {
      this.errorMessage.set(
        'Please enter the resource content.'
      );
      return;
    }

    const formData = new FormData();

    formData.append('title', title);
    formData.append('subject_id', subjectId);
    formData.append('resource_type', resourceType);
    formData.append('description', description);

    if (resourceUrl) {
      formData.append('resource_url', resourceUrl);
    }

    if (resourceContent) {
      formData.append('resource_content', resourceContent);
    }

    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    this.formSubmit.emit(formData);
  }

  // Notify the parent when the student cancels.
  cancelForm(): void {
    this.formCancel.emit();
  }
}
