
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import {
  StudentAdvancedService,
  StudentAdvancedModule,
  StudentAdvancedResponse
} from '../../../../services/student/advanced/student-advanced.service';

import { AdvancedModuleRenderer } from '../../../../features/student/advanced/advanced-module-renderer/advanced-module-renderer';

@Component({
  selector: 'app-advanced-learning-content',
  standalone: true,
  imports: [CommonModule, RouterLink, AdvancedModuleRenderer],
  templateUrl: './advanced-learning-content.html',
  styleUrl: './advanced-learning-content.css'
})
export class AdvancedLearningContent implements OnInit {
  loading = signal(true);
  errorMessage = signal('');
  lesson = signal<StudentAdvancedResponse | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private advancedService: StudentAdvancedService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const sectionId = Number(params.get('sectionId'));

      if (!Number.isInteger(sectionId) || sectionId <= 0) {
        this.errorMessage.set('Invalid advanced learning section.');
        this.loading.set(false);
        return;
      }

      this.loadContent(sectionId);
    });
  }

  loadContent(sectionId: number): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.lesson.set(null);

    this.advancedService.getAdvancedLearning(sectionId).subscribe({
      next: response => {
        if (!response.advancedUnlocked) {
          this.errorMessage.set(
            'Complete the corresponding Basic Challenge to access this content.'
          );
          this.loading.set(false);
          return;
        }

        this.lesson.set(response);
        this.loading.set(false);
      },
      error: error => {
        this.errorMessage.set(
          error.status === 403
            ? 'Complete the corresponding Basic Challenge to access this content.'
            : error.error?.message ||
              'Unable to load the advanced learning content.'
        );
        this.loading.set(false);
      }
    });
  }

  trackModule(index: number, module: StudentAdvancedModule): number {
    return module.id;
  }

  goBack(): void {
    this.router.navigate(['/advanced-learning']);
  }
}
