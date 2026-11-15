
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  signal
} from '@angular/core';

import { StudySummaryService } from '../../../services/summary/study-summary.service';

import { StudySavedSummary } from '../../../models/summary/study-summary.model';

import { SummaryGenerator } from '../summary-generator/summary-generator';
import { SummaryDisplay } from '../summary-display/summary-display';

import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-summary-panel',
  standalone: true,
  imports: [SummaryGenerator, SummaryDisplay],
  templateUrl: './summary-panel.html',
  styleUrl: './summary-panel.css',
})
export class SummaryPanel implements OnChanges {

  @Input({ required: true }) sessionUuid = '';

  @Input() totalPages = 0;

  // SIGNALS
  summaries = signal<StudySavedSummary[]>([]);

  isLoading = signal(false);

  errorMessage = signal('');

  constructor(
    private summaryService: StudySummaryService,
    private toastService: ToastService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['sessionUuid'] && this.sessionUuid) {
      this.loadSummaries();
    }

  }

  // LOAD SAVED SUMMARIES
  loadSummaries(): void {

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.summaryService.getSummaries(this.sessionUuid).subscribe({

      next: (response) => {

        this.summaries.set(response.summaries);

        this.isLoading.set(false);

      },

      error: (error) => {

        this.isLoading.set(false);

        const message =
          error.error?.message || 'Unable to load saved summaries.';

        this.errorMessage.set(message);

        this.toastService.error(message);

      }

    });

  }

}
