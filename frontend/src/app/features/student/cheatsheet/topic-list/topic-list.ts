
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  StudentCheatsheetService,
  StudentCheatsheetTopic
} from '../../../../services/student/cheatsheet/student-cheatsheet.service';

@Component({
  selector: 'app-topic-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topic-list.html',
  styleUrl: './topic-list.css'
})
export class TopicListComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cheatsheetService = inject(StudentCheatsheetService);

  categoryId = signal('');
  categoryName = signal('Topics');

  technologyId = signal('');

  topics = signal<StudentCheatsheetTopic[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  constructor() {
    this.categoryId.set(
      this.route.snapshot.paramMap.get('categoryId') || ''
    );

    this.categoryName.set(
      this.route.snapshot.queryParamMap.get('name') || 'Topics'
    );

    this.technologyId.set(
      this.route.snapshot.paramMap.get('technologyId') || ''
    );

    this.loadTopics();
  }

  loadTopics(): void {
    const id = this.categoryId();

    if (!id) {
      this.errorMessage.set('Category ID is missing.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.cheatsheetService.getTopics(Number(id)).subscribe({
      next: (response) => {
        this.topics.set(response.topics);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load topics:', error);
        this.errorMessage.set('Unable to load topics. Please try again.');
        this.loading.set(false);
      }
    });
  }

  selectTopic(topic: StudentCheatsheetTopic): void {
  this.router.navigate(
    [
      '/cheatsheet/technology',
      this.technologyId(),
      'category',
      this.categoryId(),
      'topic',
      topic.id
    ],
    {
      queryParams: { name: topic.name }
    }
  );
}

 goBack(): void {
  this.router.navigate([
    '/cheatsheet/technology',
    this.technologyId()
  ]);
}
}
