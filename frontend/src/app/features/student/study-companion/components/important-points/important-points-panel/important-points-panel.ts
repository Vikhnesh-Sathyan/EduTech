
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { StudyImportantPointsService } from '../../../services/important-points/study-important-points.service';

import {
  StudyImportantPoint
} from '../../../models/important-points/study-important-points.model';

import { ImportantPointsGenerator } from '../important-points-generator/important-points-generator';
import { ImportantPointsDisplay } from '../important-points-display/important-points-display';

import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-important-points-panel',
  standalone: true,
  imports: [
    ImportantPointsGenerator,
    ImportantPointsDisplay
  ],
  templateUrl: './important-points-panel.html',
  styleUrl: './important-points-panel.css',
})
export class ImportantPointsPanel implements OnChanges {

  @Input({ required: true }) sessionUuid = '';

  importantPoints: StudyImportantPoint[] = [];

  isLoading = false;

  errorMessage = '';

  constructor(
    private importantPointsService: StudyImportantPointsService,
    private toastService: ToastService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['sessionUuid'] && this.sessionUuid) {
      this.loadImportantPoints();
    }

  }

  // Retrieve saved important points
  loadImportantPoints(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.importantPointsService
      .getImportantPoints(this.sessionUuid)
      .subscribe({

        next: (response) => {

          this.importantPoints = response.importantPoints;

          this.isLoading = false;

        },

        error: (error) => {

          this.isLoading = false;

          this.errorMessage =
            error.error?.message ||
            'Unable to load important points.';

          this.toastService.error(this.errorMessage);

        }

      });

  }

}
