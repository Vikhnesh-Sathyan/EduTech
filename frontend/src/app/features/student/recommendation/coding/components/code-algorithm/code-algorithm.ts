
import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CodingService } from '../../../../../../services/student/coding';

interface AlgorithmStep {
  step_title: string;
  step_description: string;
  step_type:
    | 'start'
    | 'input'
    | 'process'
    | 'condition'
    | 'output'
    | 'loop'
    | 'end';
  code_line_start: number | null;
  code_line_end: number | null;
}

@Component({
  selector: 'app-code-algorithm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './code-algorithm.html',
  styleUrl: './code-algorithm.css'
})
export class CodeAlgorithmComponent {
  @Input({ required: true }) solutionId!: number;

  generating = signal(false);
  saving = signal(false);
  loading = signal(false);

  errorMessage = signal('');
  successMessage = signal('');
  steps = signal<AlgorithmStep[]>([]);

  constructor(private codingService: CodingService) {}

  ngOnInit(): void {
    this.loadSavedSteps();
  }

  loadSavedSteps(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.codingService.getAlgorithmSteps(this.solutionId).subscribe({
      next: (response: any) => {
        this.steps.set(response.steps || []);
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Failed to load algorithm steps:', error);
        this.errorMessage.set(
          error.error?.message || 'Failed to load saved algorithm steps.'
        );
        this.loading.set(false);
      }
    });
  }

  generateAlgorithm(): void {
    this.generating.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.steps.set([]);

    this.codingService.generateAlgorithm(this.solutionId).subscribe({
    next: (response: any) => {
  console.log('Generated algorithm response:', response);

  if (!Array.isArray(response.steps) || response.steps.length === 0) {
    this.errorMessage.set('No algorithm steps were generated.');
    this.generating.set(false);
    return;
  }

  this.steps.set(response.steps);
  console.log('Algorithm steps stored:', this.steps());

  this.successMessage.set(
    'Algorithm generated. Review the steps before saving.'
  );

  this.generating.set(false);
},
    });
  }

  updateStep(
    index: number,
    field: 'step_title' | 'step_description',
    value: string
  ): void {
    this.steps.update(currentSteps =>
      currentSteps.map((step, currentIndex) =>
        currentIndex === index
          ? { ...step, [field]: value }
          : step
      )
    );
  }

  saveAlgorithm(): void {
    const steps = this.steps();

    if (steps.length === 0) {
      this.errorMessage.set('Generate algorithm steps before saving.');
      return;
    }

    if (
      steps.some(
        step => !step.step_title.trim() || !step.step_description.trim()
      )
    ) {
      this.errorMessage.set(
        'Every step needs a title and description.'
      );
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.codingService.createAlgorithmSteps(
      this.solutionId,
      steps
    ).subscribe({
      next: () => {
        this.successMessage.set('Algorithm steps saved successfully.');
        this.saving.set(false);
        this.loadSavedSteps();
      },
      error: (error: any) => {
        console.error('Failed to save algorithm steps:', error);
        this.errorMessage.set(
          error.error?.message || 'Failed to save algorithm steps.'
        );
        this.saving.set(false);
      }
    });
  }
}
