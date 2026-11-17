
import {
  Component,
  input,
  output,
  signal
} from '@angular/core';

import { finalize } from 'rxjs';

import { StudyImportantPointsService } from '../../../services/important-points/study-important-points.service';

import { GenerateImportantPointsResponse } from '../../../models/important-points/study-important-points.model';

import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-important-points-generator',
  standalone: true,
  imports: [],
  templateUrl: './important-points-generator.html',
  styleUrl: './important-points-generator.css',
})
export class ImportantPointsGenerator {

  // Required session input
  sessionUuid = input.required<string>();

  // Notify parent after successful generation
  pointsGenerated = output<void>();

  // Component states
  isGenerating = signal(false);

  generatedCount = signal(0);

  constructor(
    private importantPointsService: StudyImportantPointsService,
    private toastService: ToastService
  ) {}

  // Generate and save important points
  generateImportantPoints(): void {

    if (this.isGenerating() || !this.sessionUuid()) {
      return;
    }

    this.isGenerating.set(true);
    this.generatedCount.set(0);

    this.importantPointsService
      .generateImportantPoints(this.sessionUuid())
      .pipe(
        finalize(() => {
          this.isGenerating.set(false);
        })
      )
      .subscribe({

        next: (response: GenerateImportantPointsResponse) => {

          this.generatedCount.set(response.savedCount);

          this.pointsGenerated.emit();

          this.toastService.success(
            'Important points generated successfully.'
          );

        },

        error: (error) => {

          this.toastService.error(
            error.error?.message ||
            'Unable to generate important points.'
          );

        }

      });

  }

}
