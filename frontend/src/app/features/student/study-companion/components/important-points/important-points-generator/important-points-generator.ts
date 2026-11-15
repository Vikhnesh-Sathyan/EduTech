
import { Component, EventEmitter, Input, Output } from '@angular/core';

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

  @Input({ required: true }) sessionUuid = '';

  @Output() pointsGenerated = new EventEmitter<void>();

  isGenerating = false;

  generatedCount = 0;

  constructor(
    private importantPointsService: StudyImportantPointsService,
    private toastService: ToastService
  ) {}

  // Generate and save important points
  generateImportantPoints(): void {

    if (this.isGenerating || !this.sessionUuid) {
      return;
    }

    this.isGenerating = true;
    this.generatedCount = 0;

    this.importantPointsService
      .generateImportantPoints(this.sessionUuid)
      .subscribe({

        next: (response: GenerateImportantPointsResponse) => {

          this.isGenerating = false;

          this.generatedCount = response.savedCount;

          this.pointsGenerated.emit();

          this.toastService.success(
            'Important points generated successfully.'
          );

        },

        error: (error) => {

          this.isGenerating = false;

          this.toastService.error(
            error.error?.message ||
            'Unable to generate important points.'
          );

        }

      });

  }

}
