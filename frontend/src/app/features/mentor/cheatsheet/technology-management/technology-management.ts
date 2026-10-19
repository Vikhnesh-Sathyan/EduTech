
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MentorCheatsheetTechnology,
  MentorCheatsheetTechnologyService
} from '../../../../services/mentor/cheatsheet/mentor-cheatsheet-technology';

@Component({
  selector: 'app-technology-management',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './technology-management.html',
  styleUrl: './technology-management.css'
})
export class TechnologyManagementComponent {

  private technologyService = inject(
    MentorCheatsheetTechnologyService
  );

  technologies = signal<MentorCheatsheetTechnology[]>([]);
  loading = signal(false);
  error = signal('');
  selectedTechnologyId = signal<number | null>(null);

  constructor() {
    this.loadTechnologies();
  }

  loadTechnologies(): void {
    this.loading.set(true);
    this.error.set('');

    this.technologyService.getTechnologies().subscribe({
      next: (response) => {
        this.technologies.set(response.technologies);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err.error?.message || 'Failed to load technologies.'
        );

        this.loading.set(false);
      }
    });
  }

  selectTechnology(technologyId: number): void {
    this.selectedTechnologyId.set(technologyId);
  }
}
