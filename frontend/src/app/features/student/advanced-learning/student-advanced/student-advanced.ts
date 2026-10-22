
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import {
  StudentAdvancedService,
  AdvancedModuleProgress
} from '../../../../services/student/student-advanced.service';

import { ToastService } from '../../../../services/toast.service';

import { AdvancedModuleCard } from '../advanced-module-card/advanced-module-card';
import { AdvancedModuleActions } from '../advanced-module-actions/advanced-module-actions';

@Component({
  selector: 'app-student-advanced',
  standalone: true,
  imports: [
    CommonModule,
    AdvancedModuleCard,
    AdvancedModuleActions,
  ],
  templateUrl: './student-advanced.html',
  styleUrl: './student-advanced.css'
})
export class StudentAdvanced implements OnInit {

  subtopicId!: number;

  loading = signal(true);
  errorMessage = signal('');

  advanced = signal<any | null>(null);
  modules = signal<any[]>([]);

  progressLoading = signal(false);
  completingModuleId = signal<number | null>(null);

  totalModules = signal(0);
  completedModules = signal(0);
  progressPercentage = signal(0);

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
      this.errorMessage.set(
        'Valid subtopic information is required.'
      );
      return;
    }

    this.subtopicId = Number(id);
    this.loadAdvancedLearning();
  }

  // Load Advanced Learning content.
  loadAdvancedLearning(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.advancedService.getAdvancedLearning(this.subtopicId).subscribe({
      next: (response: any) => {
        this.advanced.set(response.advanced || null);
        this.modules.set(response.modules || []);
        this.loading.set(false);

        this.loadModuleProgress();
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

  // Load saved module completion progress.
  loadModuleProgress(): void {
    this.progressLoading.set(true);

    this.advancedService
      .getAdvancedModuleProgress(this.subtopicId)
      .subscribe({
        next: (response) => {
          this.totalModules.set(response.totalModules);
          this.completedModules.set(response.completedModules);
          this.progressPercentage.set(response.progressPercentage);

          const progressById = new Map<number, AdvancedModuleProgress>(
            response.modules.map(module => [
              module.module_id,
              module
            ])
          );

          this.modules.update(modules =>
            modules.map(module => ({
              ...module,
              completed:
                progressById.get(module.id)?.completed ?? false,
              completedAt:
                progressById.get(module.id)?.completed_at ?? null
            }))
          );

          this.progressLoading.set(false);
        },

        error: (error) => {
          this.progressLoading.set(false);

          this.toastService.error(
            error.error?.message ||
            'Unable to load module completion progress.'
          );
        }
      });
  }

  // Complete a module selected in the child component.
  completeModule(moduleId: number): void {
    if (this.completingModuleId() !== null) {
      return;
    }

    const module = this.modules().find(
      item => item.id === moduleId
    );

    if (!module || module.completed) {
      return;
    }

    this.completingModuleId.set(moduleId);

    this.advancedService
      .completeAdvancedModule(this.subtopicId, moduleId)
      .subscribe({
        next: () => {
          this.modules.update(modules =>
            modules.map(item =>
              item.id === moduleId
                ? { ...item, completed: true }
                : item
            )
          );

          this.completedModules.update(count => count + 1);
          this.totalModules.set(this.modules().length);

          this.progressPercentage.set(
            this.totalModules() > 0
              ? Math.round(
                  (this.completedModules() / this.totalModules()) * 100
                )
              : 0
          );

          this.completingModuleId.set(null);

          this.toastService.success(
            'Advanced module marked as completed!'
          );
        },

        error: (error) => {
          this.completingModuleId.set(null);

          this.toastService.error(
            error.error?.message ||
            'Unable to mark this module as completed.'
          );
        }
      });
  }

  // Navigate back to the Study page.
  backToStudy(): void {
    this.router.navigate(['/study']);
  }

  // Convert module type keys into readable titles.
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

    return titles[moduleType] ||
      moduleType.replace(/_/g, ' ');
  }

  // Keep available for templates or future tracking.
  trackByModuleId(index: number, module: any): number {
    return module.id;
  }

  // Build a mentor message for a specific module.

askAboutModule(moduleId: number): void {
  const selectedModule = this.modules().find(
    module => module.id === moduleId
  );

  if (!selectedModule) {
    this.toastService.error('Unable to identify this learning module.');
    return;
  }

  const advancedData = this.advanced();

  const subject = advancedData?.subject_title || 'Unknown Subject';
  const topic = advancedData?.topic_title || 'Unknown Topic';
  const subtopic = advancedData?.subtopic_title || 'Unknown Subtopic';

  const moduleType = this.moduleTitle(
    selectedModule.moduleType ??
    selectedModule.module_type ??
    ''
  );

  const moduleName =
    selectedModule.content?.title ||
    selectedModule.title ||
    moduleType;

  const suggestedMessage =
    `Hi, I need help with the subject "${subject}", ` +
    `topic "${topic}", and subtopic "${subtopic}". ` +
    `Please explain the "${moduleName}" module ` +
    `(${moduleType}) using a simple example.`;

  this.router.navigate(['/student-chat'], {
    state: { suggestedMessage }
  });
}



}
