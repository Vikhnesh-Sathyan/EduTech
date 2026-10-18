
import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CodingService } from '../../../../../../services/student/coding';

@Component({
  selector: 'app-code-animation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './code-animation.html',
  styleUrl: './code-animation.css'
})
export class CodeAnimationComponent implements OnInit {
  @Input({ required: true }) solutionId!: number;
  @Input() canEdit = false;
  @Input() code = '';

  steps = signal<any[]>([]);
  currentStepIndex = signal(0);

  generatedSteps = signal<any[]>([]);
  isReviewing = signal(false);

  loading = signal(false);
  generating = signal(false);
  saving = signal(false);
  error = signal('');
  success = signal('');

  constructor(private codingService: CodingService) {}

  ngOnInit(): void {
    this.loadAnimationSteps();
  }

  loadAnimationSteps(): void {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.codingService.getCodeAnimationSteps(this.solutionId).subscribe({
      next: (response: any) => {
        const savedSteps = (response.steps || []).map((step: any) => ({
          ...step,
          variable_state: this.parseVariableState(step.variable_state)
        }));

        this.steps.set(savedSteps);
        this.currentStepIndex.set(0);
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Failed to load animation steps:', error);

        this.error.set(
          error.error?.message || 'Failed to load animation steps.'
        );

        this.loading.set(false);
      }
    });
  }

  generateAnimation(): void {
    this.generating.set(true);
    this.error.set('');
    this.success.set('');
    this.isReviewing.set(false);
    this.generatedSteps.set([]);

    this.codingService.generateCodeAnimationSteps(this.solutionId).subscribe({
      next: (response: any) => {
        const steps = (response.steps || []).map((step: any) => ({
          ...step,
          variable_state: this.parseVariableState(step.variable_state)
        }));

        if (steps.length === 0) {
          this.error.set('No animation steps were generated.');
          this.generating.set(false);
          return;
        }

        this.generatedSteps.set(steps);
        this.isReviewing.set(true);
        this.generating.set(false);
      },
      error: (error: any) => {
        console.error('Failed to generate animation steps:', error);

        this.error.set(
          error.error?.message || 'Failed to generate animation steps.'
        );

        this.generating.set(false);
      }
    });
  }

  saveAnimation(): void {
    if (!this.canEdit || this.generatedSteps().length === 0) {
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    const steps = this.generatedSteps().map((step: any) => ({
      step_title: step.step_title,
      explanation: step.explanation,
      code_line: step.code_line,
      variable_state: step.variable_state,
      action_type: step.action_type
    }));

    this.codingService
      .createCodeAnimationSteps(this.solutionId, steps)
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.isReviewing.set(false);
          this.generatedSteps.set([]);
          this.success.set('Animation steps saved successfully.');
          this.loadAnimationSteps();
        },
        error: (error: any) => {
          console.error('Failed to save animation steps:', error);

          this.error.set(
            error.error?.message || 'Failed to save animation steps.'
          );

          this.saving.set(false);
        }
      });
  }

  cancelReview(): void {
    this.isReviewing.set(false);
    this.generatedSteps.set([]);
    this.error.set('');
  }

  updateGeneratedStep(
    index: number,
    field: 'step_title' | 'explanation',
    value: string
  ): void {
    this.generatedSteps.update(steps =>
      steps.map((step, stepIndex) =>
        stepIndex === index
          ? { ...step, [field]: value }
          : step
      )
    );
  }

  currentStep(): any | null {
    return this.steps()[this.currentStepIndex()] ?? null;
  }
//splits your original code into individual lines.
  getCodeLines(): string[] {
   return this.code.split('\n');
  }
//checks whether a line matches the current animation step's code_line
  isActiveLine(lineNumber: number): boolean {
    return this.currentStep()?.code_line === lineNumber;
  }

  previousStep(): void {
    if (this.currentStepIndex() > 0) {
      this.currentStepIndex.update(index => index - 1);
    }
  }

  nextStep(): void {
    if (this.currentStepIndex() < this.steps().length - 1) {
      this.currentStepIndex.update(index => index + 1);
    }
  }

  objectKeys(value: Record<string, any>): string[] {
    return Object.keys(value || {});
  }

  private parseVariableState(value: any): Record<string, any> | null {
    if (value == null || value === '') {
      return null;
    }

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);

        return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
          ? parsed
          : null;
      } catch {
        return null;
      }
    }

    return typeof value === 'object' && !Array.isArray(value)
      ? value
      : null;
  }
}
