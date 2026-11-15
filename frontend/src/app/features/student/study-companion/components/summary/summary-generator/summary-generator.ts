
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { StudySummaryService } from '../../../services/summary/study-summary.service';

import {
  StudySummaryLength,
  StudySummaryResponse,
  StudyPageSummaryResponse
} from '../../../models/summary/study-summary.model';

import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-summary-generator',
  standalone: true,
  imports: [],
  templateUrl: './summary-generator.html',
  styleUrl: './summary-generator.css',
})
export class SummaryGenerator {

  @Input({ required: true }) sessionUuid = '';

  @Input() totalPages = 0;

  @Output() summaryGenerated = new EventEmitter<void>();

  summaryMode: 'full' | 'pages' = 'full';

  summaryType: StudySummaryLength = 'medium';

  startPage = 1;
  endPage = 1;

  isGenerating = false;

  generatedSummary = '';

  constructor(
    private summaryService: StudySummaryService,
    private toastService: ToastService
  ) {}

  generateSummary(): void {

    if (this.isGenerating) {
      return;
    }

    this.isGenerating = true;
    this.generatedSummary = '';

    if (this.summaryMode === 'full') {

      this.summaryService.generateSummary(
        this.sessionUuid,
        {
          summary_type: this.summaryType
        }
      ).subscribe({

        next: (response: StudySummaryResponse) => {

          this.handleSuccess(response.summary);

        },

        error: (error) => {

          this.handleError(error);

        }

      });

      return;
    }

    if (
      this.startPage < 1 ||
      this.endPage < this.startPage ||
      this.endPage > this.totalPages
    ) {

      this.isGenerating = false;

      this.toastService.error('Please select a valid page range.');

      return;
    }

    this.summaryService.generatePageSummary(
      this.sessionUuid,
      {
        start_page: this.startPage,
        end_page: this.endPage,
        summary_type: this.summaryType
      }
    ).subscribe({

      next: (response: StudyPageSummaryResponse) => {

        this.handleSuccess(response.summary);

      },

      error: (error) => {

        this.handleError(error);

      }

    });

  }

  private handleSuccess(summary: string): void {

    this.generatedSummary = summary;

    this.isGenerating = false;

    this.summaryGenerated.emit();

    this.toastService.success('Summary generated successfully.');

  }

  private handleError(error: any): void {

    this.isGenerating = false;

    this.toastService.error(
      error.error?.message || 'Unable to generate summary.'
    );

  }

}
