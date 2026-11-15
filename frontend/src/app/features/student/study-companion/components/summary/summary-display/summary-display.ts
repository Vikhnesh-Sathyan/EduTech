
import { Component, input } from '@angular/core';

import { StudySavedSummary } from '../../../models/summary/study-summary.model';

@Component({
  selector: 'app-summary-display',
  standalone: true,
  imports: [],
  templateUrl: './summary-display.html',
  styleUrl: './summary-display.css',
})
export class SummaryDisplay {

  // INPUT SIGNAL
  summaries = input<StudySavedSummary[]>([]);

  getSummaryLabel(summary: StudySavedSummary): string {

    if (summary.summaryType === 'full') {
      return 'Full Document Summary';
    }

    if (summary.summaryType === 'page_wise') {
      return `Pages ${summary.startPage} - ${summary.endPage}`;
    }

    return 'Custom Summary';
  }

  formatDate(date: string): string {

    return new Date(date).toLocaleString();

  }

}
