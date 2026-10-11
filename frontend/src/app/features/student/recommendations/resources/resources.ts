import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  inject,
  input,
  signal
} from '@angular/core';

import { StudentRecommendationsService } from '../../../../services/student/student-recommendations.service';

interface CommunityResource {
  id: number;
  student_id: number;
  subject_id: number;
  title: string;
  description: string | null;
  resource_type: string;
  resource_url: string | null;
  resource_content: string | null;
  created_at: string;
  student_name?: string;
}

@Component({
  selector: 'app-student-resources',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resources.html',
  styleUrl: './resources.css'
})
export class Resources {

  private recommendationsService = inject(StudentRecommendationsService);

  subjectId = input<string | null>(null);

  resources = signal<CommunityResource[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  constructor() {
    effect(() => {
      const id = this.subjectId();

      if (id) {
        this.loadResources(id);
      }
    });
  }

  loadResources(subjectId: string): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.recommendationsService
      .getApprovedResources(subjectId)
      .subscribe({
        next: (data) => {
          this.resources.set(
            Array.isArray(data) ? data : []
          );
          this.loading.set(false);
        },
        error: (error) => {
          console.error(
            'Failed to load community resources:',
            error
          );

          this.errorMessage.set(
            error.error?.message ||
            'Unable to load resources. Please try again.'
          );

          this.loading.set(false);
        }
      });
  }
}
