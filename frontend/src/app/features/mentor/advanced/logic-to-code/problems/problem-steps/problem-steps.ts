import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  LogicToCodeService
} from '../../../../../../services/mentor/advanced/logic-to-code/logic-to-code.service';

import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-problem-steps',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './problem-steps.html',
  styleUrl: './problem-steps.css'
})

export class ProblemSteps implements OnChanges, OnInit {

  private logicToCodeService = inject(LogicToCodeService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);

  // RECEIVE PROBLEM ID FROM PARENT
  @Input() problemId!: number;

  // NOTIFY PARENT AFTER SUCCESSFUL SAVE
  @Output() stepsSaved = new EventEmitter<void>();

  // LOGIC STEPS
  steps = signal<string[]>(['']);

  // LOADING AND SAVING STATES
  saving = signal(false);
  loading = signal(false);

  // RELOAD WHEN PROBLEM ID CHANGES
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['problemId'] && this.problemId) {
      this.loadSteps();
    }
  }
ngOnInit(): void {

  // GET PROBLEM ID FROM URL WHEN OPENED AS A ROUTE
  this.route.paramMap.subscribe(params => {

    const routeProblemId = Number(params.get('problemId'));

    if (Number.isInteger(routeProblemId) && routeProblemId > 0) {

      this.problemId = routeProblemId;

      this.loadSteps();

    }

  });

}

  // LOAD EXISTING LOGIC STEPS
  loadSteps(): void {

    this.loading.set(true);

    this.logicToCodeService
      .getProblemSteps(this.problemId)
      .subscribe({

        next: (response) => {

          this.steps.set(
            response.steps.length > 0
              ? response.steps.map(step => step.step_description)
              : ['']
          );

          this.loading.set(false);
        },

        error: (error) => {

          this.loading.set(false);

          this.toastService.error(
            error.error?.message || 'Unable to load logic steps.'
          );

        }

      });
  }

  // ADD NEW STEP
  addStep(): void {
    this.steps.update(current => [...current, '']);
  }

  // REMOVE STEP
  removeStep(index: number): void {

    if (this.saving()) return;

    this.steps.update(current =>
      current.filter((_, i) => i !== index)
    );

    // Keep one empty input available
    if (this.steps().length === 0) {
      this.steps.set(['']);
    }
  }

  // UPDATE STEP
updateStep(index: number, value: string): void {
  this.steps.update(current =>
    current.map((step, i) =>
      i === index ? value : step
    )
  );
}

// TRACK STEPS BY INDEX
trackByIndex(index: number): number {
  return index;
}

  // MOVE STEP UP
  moveStepUp(index: number): void {

    if (index === 0 || this.saving()) return;

    this.steps.update(current => {

      const updated = [...current];

      [updated[index - 1], updated[index]] =
        [updated[index], updated[index - 1]];

      return updated;
    });
  }

  // MOVE STEP DOWN
  moveStepDown(index: number): void {

    if (this.saving()) return;

    this.steps.update(current => {

      if (index >= current.length - 1) {
        return current;
      }

      const updated = [...current];

      [updated[index], updated[index + 1]] =
        [updated[index + 1], updated[index]];

      return updated;
    });
  }



  // SAVE LOGIC STEPS
  saveSteps(): void {

    if (this.saving()) return;

    const validSteps = this.steps()
      .map(step => step.trim())
      .filter(step => step.length > 0);

    if (validSteps.length === 0) {

      this.toastService.error(
        'Please add at least one logical step.'
      );

      return;
    }

    this.saving.set(true);

    this.logicToCodeService.addProblemSteps(
      this.problemId,
      { steps: validSteps }
    ).subscribe({

      next: (response) => {

        this.saving.set(false);

        // UPDATE UI WITH SAVED STEPS
        this.steps.set(validSteps);

        this.toastService.success(
          response.message || 'Logic steps saved successfully.'
        );

        this.stepsSaved.emit();
      },

      error: (error) => {

        this.saving.set(false);

        this.toastService.error(
          error.error?.message || 'Unable to save logic steps.'
        );

      }

    });
  }
}
