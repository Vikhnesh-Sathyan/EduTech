
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { LogicToCodeService } from '../../../../../../services/mentor/advanced/logic-to-code/logic-to-code.service';
import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-hint-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hint-management.html',
  styleUrl: './hint-management.css'
})

export class HintManagement {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private logicToCodeService = inject(LogicToCodeService);
  private toastService = inject(ToastService);

  problemId = Number(this.route.snapshot.paramMap.get('problemId'));

  hints = signal<string[]>([]);
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);

  ngOnInit(): void {
    if (!this.problemId || this.problemId <= 0) {
      this.toastService.error('Invalid problem ID.');
      this.goBack();
      return;
    }

    this.loadHints();
  }

  // LOAD EXISTING HINTS
  loadHints(): void {
    this.isLoading.set(true);

    this.logicToCodeService.getHints(this.problemId).subscribe({
      next: (response) => {
        this.hints.set(
          response.hints.map((hint) => hint.hint_content)
        );

        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);

        this.toastService.error(
          error.error?.message || 'Failed to load hints.'
        );
      }
    });
  }

  // ADD NEW HINT
  addHint(): void {
    this.hints.update((currentHints) => [
      ...currentHints,
      ''
    ]);
  }

  // UPDATE HINT CONTENT
  updateHint(index: number, value: string): void {
    this.hints.update((currentHints) =>
      currentHints.map((hint, i) =>
        i === index ? value : hint
      )
    );
  }

  // REMOVE HINT
  removeHint(index: number): void {
    this.hints.update((currentHints) =>
      currentHints.filter((_, i) => i !== index)
    );
  }

  // MOVE HINT UP
  moveHintUp(index: number): void {
    if (index <= 0) return;

    this.hints.update((currentHints) => {
      const updatedHints = [...currentHints];

      [updatedHints[index - 1], updatedHints[index]] =
        [updatedHints[index], updatedHints[index - 1]];

      return updatedHints;
    });
  }

  // MOVE HINT DOWN
  moveHintDown(index: number): void {
    this.hints.update((currentHints) => {
      if (index >= currentHints.length - 1) {
        return currentHints;
      }

      const updatedHints = [...currentHints];

      [updatedHints[index], updatedHints[index + 1]] =
        [updatedHints[index + 1], updatedHints[index]];

      return updatedHints;
    });
  }

  // SAVE ALL HINTS
  saveHints(): void {
    const currentHints = this.hints();

    if (currentHints.length === 0) {
      this.toastService.error('Add at least one hint.');
      return;
    }

    if (currentHints.some((hint) => !hint.trim())) {
      this.toastService.error('Please fill in all hints.');
      return;
    }

    this.isSaving.set(true);

    this.logicToCodeService.saveHints(
      this.problemId,
      { hints: currentHints.map((hint) => hint.trim()) }
    ).subscribe({
      next: (response) => {
        this.isSaving.set(false);

        this.toastService.success(
          response.message || 'Hints saved successfully.'
        );

        this.loadHints();
      },
      error: (error) => {
        this.isSaving.set(false);

        this.toastService.error(
          error.error?.message || 'Failed to save hints.'
        );
      }
    });
  }

  // BACK TO PROBLEM LIST
  goBack(): void {
    this.router.navigate([
      '/mentor/advanced/logic-to-code'
    ]);
  }
}
