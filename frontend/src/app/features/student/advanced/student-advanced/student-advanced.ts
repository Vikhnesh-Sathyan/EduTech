import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { StudentAdvancedService } from '../../../../services/student-advanced.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-student-advanced',
  standalone: true,
  imports: [],
  templateUrl: './student-advanced.html',
  styleUrl: './student-advanced.css'
})
export class StudentAdvanced implements OnInit {

  subtopicId!: number;

  loading = signal(true);
  errorMessage = signal('');
  advanced = signal<any | null>(null);
  modules = signal<any[]>([]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private advancedService: StudentAdvancedService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('subtopicId');

    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
      this.loading.set(false);
      this.errorMessage.set('Valid subtopic information is required.');
      return;
    }

    this.subtopicId = Number(id);
    this.loadAdvancedLearning();
  }

  loadAdvancedLearning(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.advancedService.getAdvancedLearning(this.subtopicId).subscribe({
      next: (response: any) => {
        this.advanced.set(response.advanced || null);
        this.modules.set(response.modules || []);
        this.loading.set(false);
      },

      error: (error) => {
        this.loading.set(false);

        if (error.status === 403) {
          this.errorMessage.set(
            'Pass the Basic Challenge to unlock Advanced Learning.'
          );
        } else if (error.status === 404) {
          this.errorMessage.set(
            error.error?.message ||
            'Advanced Learning is not available for this subtopic yet.'
          );
        } else {
          this.errorMessage.set(
            error.error?.message ||
            'Unable to load Advanced Learning. Please try again.'
          );
        }

        this.toastService.error(this.errorMessage());
      }
    });
  }

  backToStudy(): void {
    this.router.navigate([
      '/study'
    ]);
  }

  moduleTitle(moduleType: string): string {
    const titles: Record<string, string> = {
      deep_dive: 'Deep Dive',
      behind_the_scenes: 'Behind the Scenes',
      concept_comparison: 'Concept Comparison',
      debugging: 'Debugging',
      real_world_scenario: 'Real-World Scenario',
      code_challenge: 'Code Challenge',
      mini_hands_on_coding: 'Mini Hands-on Coding',
      advanced_practice: 'Advanced Practice',
      architecture_design: 'Architecture Design',
      interview_challenge: 'Interview Challenge'
    };

    return titles[moduleType] || moduleType.replace(/_/g, ' ');
  }

  trackByModuleId(index: number, module: any): number {
    return module.id;
  }
}
