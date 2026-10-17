import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodingService } from '../../../../../../services/student/coding';

@Component({
  selector: 'app-code-highlight',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './code-highlight.html',
  styleUrl: './code-highlight.css'
})

export class CodeHighlightComponent implements OnInit {
  @Input() solutionId!: number;
  @Input() code = '';
  @Input() canEdit = false;

  highlights = signal<any[]>([]);
  loading = signal(false);
  error = signal('');
  selectedHighlight = signal<any | null>(null);

  showForm = signal(false);
  editingHighlightId = signal<number | null>(null);

  startLine = signal(1);
  endLine = signal(1);
  explanation = signal('');

  constructor(private codingService: CodingService) {}

  ngOnInit(): void {
    this.loadHighlights();
  }

  get codeLines(): string[] {
    return this.code.split('\n');
  }

  loadHighlights(): void {
    if (!this.solutionId) {
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.codingService.getCodeHighlights(this.solutionId).subscribe({
      next: (response: any) => {
        this.highlights.set(
          Array.isArray(response)
            ? response
            : response.highlights || []
        );
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Failed to load code highlights:', error);
        this.error.set(
          error.error?.message || 'Failed to load code highlights.'
        );
        this.loading.set(false);
      }
    });
  }

  getHighlightForLine(lineNumber: number): any | null {
    return this.highlights().find(
      highlight =>
        lineNumber >= Number(highlight.start_line) &&
        lineNumber <= Number(highlight.end_line)
    ) || null;
  }

  openExplanation(highlight: any): void {
    this.selectedHighlight.set(highlight);
  }

  closeExplanation(): void {
    this.selectedHighlight.set(null);
  }

  openCreateForm(lineNumber: number): void {
    if (!this.canEdit) {
      return;
    }

    this.editingHighlightId.set(null);
    this.startLine.set(lineNumber);
    this.endLine.set(lineNumber);
    this.explanation.set('');
    this.showForm.set(true);
    this.selectedHighlight.set(null);
    this.error.set('');
  }

  openEditForm(highlight: any): void {
    if (!this.canEdit) {
      return;
    }

    this.editingHighlightId.set(Number(highlight.id));
    this.startLine.set(Number(highlight.start_line));
    this.endLine.set(Number(highlight.end_line));
    this.explanation.set(highlight.explanation || '');
    this.showForm.set(true);
    this.selectedHighlight.set(null);
    this.error.set('');
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingHighlightId.set(null);
  }

  saveHighlight(): void {
    const start = Number(this.startLine());
    const end = Number(this.endLine());
    const explanation = this.explanation().trim();

    if (
      !Number.isInteger(start) ||
      !Number.isInteger(end) ||
      start < 1 ||
      end < start ||
      end > this.codeLines.length
    ) {
      this.error.set('Enter a valid line range.');
      return;
    }

    if (!explanation) {
      this.error.set('Please enter an explanation.');
      return;
    }

    const payload = {
      start_line: start,
      end_line: end,
      explanation,
      highlight_color: '#ef4444'
    };

    const highlightId = this.editingHighlightId();

    const request = highlightId
      ? this.codingService.updateCodeHighlight(
          this.solutionId,
          highlightId,
          payload
        )
      : this.codingService.createCodeHighlight(
          this.solutionId,
          payload
        );

    request.subscribe({
      next: () => {
        this.closeForm();
        this.loadHighlights();
      },
      error: (error: any) => {
        console.error('Failed to save code highlight:', error);
        this.error.set(
          error.error?.message || 'Failed to save code highlight.'
        );
      }
    });
  }

  deleteHighlight(highlight: any): void {
    if (!this.canEdit || !confirm('Delete this code highlight?')) {
      return;
    }

    this.codingService
      .deleteCodeHighlight(this.solutionId, Number(highlight.id))
      .subscribe({
        next: () => {
          this.selectedHighlight.set(null);
          this.loadHighlights();
        },
        error: (error: any) => {
          console.error('Failed to delete code highlight:', error);
          this.error.set(
            error.error?.message || 'Failed to delete code highlight.'
          );
        }
      });
  }
}
