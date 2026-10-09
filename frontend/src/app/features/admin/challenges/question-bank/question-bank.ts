import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminBasicChallengeService } from '../../../../services/admin/admin-basic-challenge.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-question-bank',
  standalone: true,
  templateUrl: './question-bank.html',
  styleUrl: './question-bank.css'
})
export class QuestionBank implements OnInit {

  subtopicId!: number;

  selectedFile = signal<File | null>(null);

  totalRows = signal(0);
  validCount = signal(0);
  errorCount = signal(0);

  questions = signal<any[]>([]);
  errors = signal<any[]>([]);

  previewed = signal(false);
  loading = signal(false);
  importing = signal(false);

  constructor(
    private route: ActivatedRoute,
    private basicChallengeService: AdminBasicChallengeService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('subtopicId');

    if (!id) {
      this.toastService.error('Subtopic information is missing.');
      return;
    }

    this.subtopicId = Number(id);
  }

  // ---------------- FILE SELECT ----------------

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    this.selectedFile.set(input.files[0]);
    this.clearPreview();
  }

  // ---------------- PREVIEW ----------------

  previewQuestions(): void {
    const file = this.selectedFile();

    if (!file) {
      this.toastService.error('Please select an Excel or CSV file.');
      return;
    }

    this.loading.set(true);

    this.basicChallengeService.previewQuestions(file).subscribe({
      next: (response: any) => {
        this.loading.set(false);

        this.totalRows.set(response.totalRows);
        this.validCount.set(response.validCount);
        this.errorCount.set(response.errorCount);

        this.questions.set(response.questions || []);
        this.errors.set(response.errors || []);

        this.previewed.set(true);

        if (response.errorCount > 0) {
          this.toastService.error(`${response.errorCount} question(s) need correction.`);
        } else {
          this.toastService.success(`${response.validCount} questions are ready to import.`);
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.toastService.error(
          error.error?.message || 'Failed to process the question file.'
        );
      }
    });
  }

  // ---------------- CONFIRM IMPORT ----------------

  confirmImport(): void {
    if (!this.questions().length) {
      this.toastService.error('There are no valid questions to import.');
      return;
    }

    if (this.errorCount() > 0) {
      this.toastService.error('Fix the invalid rows before importing.');
      return;
    }

    this.importing.set(true);

    this.basicChallengeService
      .confirmImport(this.subtopicId, this.questions())
      .subscribe({
        next: (response: any) => {
          this.importing.set(false);

          this.toastService.success(
            response.message ||
            `${this.questions().length} questions imported successfully.`
          );

          this.resetImport();
        },
        error: (error) => {
          this.importing.set(false);
          this.toastService.error(
            error.error?.message || 'Failed to import questions.'
          );
        }
      });
  }

  // ---------------- RESET ----------------

  resetImport(): void {
    this.selectedFile.set(null);
    this.clearPreview();
  }

  private clearPreview(): void {
    this.previewed.set(false);
    this.questions.set([]);
    this.errors.set([]);
    this.totalRows.set(0);
    this.validCount.set(0);
    this.errorCount.set(0);
  }
}