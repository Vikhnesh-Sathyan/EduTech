
import { Component, input } from '@angular/core';

import { MarkdownComponent } from 'ngx-markdown';

import { StudySavedSummary } from '../../../models/summary/study-summary.model';

@Component({
  selector: 'app-summary-display',
  standalone: true,
  imports: [MarkdownComponent],
  templateUrl: './summary-display.html',
  styleUrl: './summary-display.css',
})
export class SummaryDisplay {

  // Receives saved summaries from parent component
  summaries = input<StudySavedSummary[]>([]);

  // Returns summary category label
  getSummaryLabel(summary: StudySavedSummary): string {

    if (summary.summaryType === 'full') {
      return 'Full Document Summary';
    }

    if (summary.summaryType === 'page_wise') {
      return `Pages ${summary.startPage} - ${summary.endPage}`;
    }

    return 'Custom Summary';
  }

  // Formats summary creation date
  formatDate(date: string): string {

    return new Date(date).toLocaleString();

  }

  // Fixes escaped Markdown characters in existing summaries
  formatMarkdown(content: string): string {

    return content.replace(/\\([#*_])/g, '$1');

  }

}
