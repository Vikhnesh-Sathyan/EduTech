import {
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { Subscription, TimeoutError, timeout } from 'rxjs';

import { StudySummaryService } from '../../../services/summary/study-summary.service';

import { StudySummaryLength } from '../../../models/summary/study-summary.model';

import { ToastService } from '../../../../../../services/toast.service';

const REQUEST_TIMEOUT_MS = 120_000;

@Component({
  selector: 'app-summary-generator',
  standalone: true,
  imports: [],
  templateUrl: './summary-generator.html',
  styleUrl: './summary-generator.css',
})
export class SummaryGenerator {

  private summaryService = inject(StudySummaryService);
  private toastService = inject(ToastService);

  sessionUuid = input.required<string>();
  totalPages = input(0);

  summaryGenerated = output<void>();

  summaryMode = signal<'full' | 'pages'>('full');
  summaryType = signal<StudySummaryLength>('medium');

  startPage = signal(1);
  endPage = signal(1);

  isGenerating = signal(false);
  generatedSummary = signal('');

  private requestSub?: Subscription;

  // True when the selected page range cannot be sent
  isPageRangeInvalid = computed(() => {
    const start = this.startPage();
    const end = this.endPage();

    return (
      !Number.isInteger(start) ||
      !Number.isInteger(end) ||
      start < 1 ||
      end < start ||
      end > this.totalPages()
    );
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.requestSub?.unsubscribe());
  }

  // ==========================================
  // FORM INPUT
  // ==========================================

  onStartPageChange(value: string): void {
    this.startPage.set(Number(value));
  }

  onEndPageChange(value: string): void {
    this.endPage.set(Number(value));
  }

  // ==========================================
  // GENERATE SUMMARY
  // ==========================================

  generateSummary(): void {
    if (this.isGenerating()) {
      return;
    }

    const isPageMode = this.summaryMode() === 'pages';

    if (isPageMode && this.isPageRangeInvalid()) {
      this.toastService.error('Please select a valid page range.');
      return;
    }

    this.isGenerating.set(true);
    this.generatedSummary.set('');

    const request$ = isPageMode
      ? this.summaryService.generatePageSummary(this.sessionUuid(), {
          start_page: this.startPage(),
          end_page: this.endPage(),
          summary_type: this.summaryType()
        })
      : this.summaryService.generateSummary(this.sessionUuid(), {
          summary_type: this.summaryType()
        });

    this.requestSub?.unsubscribe();

    this.requestSub = request$
      .pipe(timeout(REQUEST_TIMEOUT_MS))
      .subscribe({
        next: (response) => this.handleSuccess(response.summary),
        error: (error) => this.handleError(error)
      });
  }

  // ==========================================
  // RESULT HANDLING
  // ==========================================

  private handleSuccess(summary: string): void {
    this.generatedSummary.set(summary);
    this.isGenerating.set(false);

    this.summaryGenerated.emit();
    this.toastService.success('Summary generated successfully.');
  }

  private handleError(error: any): void {
    this.isGenerating.set(false);

    if (error instanceof TimeoutError) {
      this.toastService.error(
        'Summary is taking too long. Try a shorter page range.'
      );
      return;
    }

    this.toastService.error(
      error.error?.message ||
      error.error?.detail ||
      'Unable to generate summary.'
    );
  }
}