
import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  CodeLogicService
} from '../../../../../services/mentor/advanced/code-logic/code-logic.service';

interface CodeLogicExampleView {
  input: string;
  output: string;
  explanation?: string;
}

interface CodeLogicQuestionView {
  question: string;
  expected_answer: string;
  marks: number;
}

@Component({
  selector: 'app-code-logic-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './code-logic-view.html',
  styleUrl: './code-logic-view.css'
})
export class CodeLogicView implements OnInit {
  readonly problemId = signal<number>(0);

  readonly loading = signal(true);
  readonly errorMessage = signal('');

  readonly problem = signal<any>(null);

  readonly examples = signal<CodeLogicExampleView[]>([]);
  readonly algorithmSteps = signal<string[]>([]);
  readonly predictionQuestions = signal<CodeLogicQuestionView[]>([]);

  readonly modeLabel = computed(() =>
    this.problem()?.mode === 'understand_code'
      ? 'Code → Logic'
      : 'Logic → Code'
  );

  readonly statusLabel = computed(() => {
    const status = this.problem()?.status;

    if (status === 'published') {
      return 'Published';
    }

    if (status === 'inactive') {
      return 'Inactive';
    }

    return 'Draft';
  });

  readonly formattedPublishDate = computed(() =>
    this.formatDate(this.problem()?.publish_date)
  );

  readonly formattedDueDate = computed(() =>
    this.formatDate(this.problem()?.due_date)
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private codeLogicService: CodeLogicService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage.set('Invalid problem ID.');
      this.loading.set(false);
      return;
    }

    this.problemId.set(id);
    this.loadProblem();
  }

  loadProblem(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.codeLogicService.getProblemById(this.problemId()).subscribe({
      next: (response) => {
        const item = response.problem;

        if (!item) {
          this.errorMessage.set('Problem details were not found.');
          this.loading.set(false);
          return;
        }

        this.problem.set(item);

        this.examples.set(
          this.parseArray<CodeLogicExampleView>(item.examples)
        );

        this.algorithmSteps.set(
          this.parseArray<string>(item.algorithm_steps)
        );

        this.predictionQuestions.set(
          this.parseArray<CodeLogicQuestionView>(
            item.prediction_questions
          )
        );

        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.message ?? 'Unable to load problem details.'
        );
        this.loading.set(false);
      }
    });
  }

  private parseArray<T>(value: unknown): T[] {
    if (Array.isArray(value)) {
      return value as T[];
    }

    if (typeof value === 'string') {
      try {
        const parsed: unknown = JSON.parse(value);
        return Array.isArray(parsed) ? parsed as T[] : [];
      } catch {
        return [];
      }
    }

    return [];
  }

  private formatDate(value: string | null | undefined): string {
    if (!value) {
      return 'Not set';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  }

  editProblem(): void {
    if (this.problem()?.status === 'draft') {
      this.router.navigate([
        '/mentor/advanced/code-logic/edit',
        this.problemId()
      ]);
    }
  }

  goBack(): void {
    this.router.navigate(['/mentor/advanced/code-logic']);
  }
}
