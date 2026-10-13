import {
  Component,
  input,
  output,
  signal,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Study } from '../../../../../services/student/study';

@Component({
  selector: 'app-resource-filters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resource-filters.html',
  styleUrl: './resource-filters.css'
})
export class ResourceFiltersComponent implements OnInit {

  // Signal inputs received from the parent component.
  selectedSubjectId = input<number | undefined>(undefined);
  selectedResourceType = input('');

  // Signal outputs sent to the parent component.
  subjectChange = output<number | undefined>();
  resourceTypeChange = output<string>();

  // Subjects loaded from the existing API.
  subjects = signal<any[]>([]);

  // Available resource types.
  resourceTypes = [
    { label: 'All types', value: '' },
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

  // Load subjects for the subject dropdown.
  loadSubjects(): void {
    this.studyService.getSubjects().subscribe({
      next: (response: any) => {
        const subjects = Array.isArray(response)
          ? response
          : response?.subjects ?? response?.data ?? [];

        this.subjects.set(subjects);
      },

      error: (error) => {
        console.error('Failed to load subjects for filters:', error);
      }
    });
  }

  // Notify the parent when the subject changes.
  onSubjectSelect(value: string): void {
    const subjectId = value === '' ? undefined : Number(value);

    this.subjectChange.emit(subjectId);
  }

  // Notify the parent when the resource type changes.
  onResourceTypeSelect(value: string): void {
    this.resourceTypeChange.emit(value);
  }
}
