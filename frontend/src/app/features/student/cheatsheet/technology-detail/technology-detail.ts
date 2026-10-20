
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  StudentCheatsheetService,
  StudentCheatsheetCategory
} from '../../../../services/student/cheatsheet/student-cheatsheet.service';

@Component({
  selector: 'app-technology-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './technology-detail.html',
  styleUrl: './technology-detail.css'
})
export class TechnologyDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cheatsheetService = inject(StudentCheatsheetService);

  technologyId = signal('');
  technologyName = signal('Technology');

  categories = signal<StudentCheatsheetCategory[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  constructor() {
    this.technologyId.set(
      this.route.snapshot.paramMap.get('id') || ''
    );

    this.technologyName.set(
      this.route.snapshot.queryParamMap.get('name') || 'Technology'
    );

    this.loadCategories();
  }

  loadCategories(): void {
    const id = this.technologyId();

    if (!id) {
      this.errorMessage.set('Technology ID is missing.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.cheatsheetService.getCategories(Number(id)).subscribe({
      next: (response) => {
        this.categories.set(response.categories);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load categories:', error);
        this.errorMessage.set(
          'Unable to load categories. Please try again.'
        );
        this.loading.set(false);
      }
    });
  }

 selectCategory(category: StudentCheatsheetCategory): void {
  this.router.navigate(
    [
      '/cheatsheet/technology',
      this.technologyId(),
      'category',
      category.id
    ],
    {
      queryParams: { name: category.name }
    }
  );
}

  goBack(): void {
    this.router.navigate(['/student-cheatsheet']);
  }
}
