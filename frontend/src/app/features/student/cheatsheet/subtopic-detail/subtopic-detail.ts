import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  StudentCheatsheetService,
  StudentCheatsheetSubtopic
} from '../../../../services/student/cheatsheet/student-cheatsheet.service';

@Component({
  selector: 'app-subtopic-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subtopic-detail.html',
  styleUrl: './subtopic-detail.css'
})
export class SubtopicDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cheatsheetService = inject(StudentCheatsheetService);

  technologyId = signal('');
  categoryId = signal('');
  topicId = signal('');
  topicName = signal('Subtopics');

  subtopics = signal<StudentCheatsheetSubtopic[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  constructor() {
    this.technologyId.set(
      this.route.snapshot.paramMap.get('technologyId') || ''
    );

    this.categoryId.set(
      this.route.snapshot.paramMap.get('categoryId') || ''
    );

    this.topicId.set(
      this.route.snapshot.paramMap.get('topicId') || ''
    );

    this.topicName.set(
      this.route.snapshot.queryParamMap.get('name') || 'Subtopics'
    );

    this.loadSubtopics();
  }

  loadSubtopics(): void {
    const id = this.topicId();

    if (!id) {
      this.errorMessage.set('Topic ID is missing.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.cheatsheetService.getSubtopics(Number(id)).subscribe({
      next: (response) => {
        this.subtopics.set(response.subtopics);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load subtopics:', error);
        this.errorMessage.set(
          'Unable to load subtopics. Please try again.'
        );
        this.loading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate([
      '/cheatsheet/technology',
      this.technologyId(),
      'category',
      this.categoryId()
    ]);
  }
}
