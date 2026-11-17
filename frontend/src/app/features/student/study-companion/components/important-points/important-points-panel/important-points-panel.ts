import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  untracked
} from '@angular/core';
import { Subscription } from 'rxjs';

import { StudyImportantPointsService } from '../../../services/important-points/study-important-points.service';
import { StudyImportantPoint } from '../../../models/important-points/study-important-points.model';

import { ImportantPointsGenerator } from '../important-points-generator/important-points-generator';
import { ImportantPointsDisplay } from '../important-points-display/important-points-display';

import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-important-points-panel',
  standalone: true,
  imports: [ImportantPointsGenerator, ImportantPointsDisplay],
  templateUrl: './important-points-panel.html',
  styleUrl: './important-points-panel.css',
})
export class ImportantPointsPanel {

  private importantPointsService = inject(StudyImportantPointsService);
  private toastService = inject(ToastService);

  sessionUuid = input.required<string>();

  importantPoints = signal<StudyImportantPoint[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  private loadSub?: Subscription;

  constructor() {
    // Reload whenever the session changes. Only sessionUuid is tracked.
    effect(() => {
      const uuid = this.sessionUuid();

      if (uuid) {
        untracked(() => this.loadImportantPoints());
      }
    });

    inject(DestroyRef).onDestroy(() => this.loadSub?.unsubscribe());
  }

  // Retrieve saved important points
  loadImportantPoints(): void {
    this.loadSub?.unsubscribe();

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.loadSub = this.importantPointsService
      .getImportantPoints(this.sessionUuid())
      .subscribe({
        next: (response) => {
          this.importantPoints.set(response.importantPoints);
          this.isLoading.set(false);
        },
        error: (error) => {
          const message =
            error.error?.message || 'Unable to load important points.';

          this.errorMessage.set(message);
          this.isLoading.set(false);
          this.toastService.error(message);
        }
      });
  }
}