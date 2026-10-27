import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterModule } from '@angular/router';

import {
  CodeShuffleService,
  CodeShuffleLanguage,
  CodeShuffleTopic,
  CodeShuffleTaskPayload
} from '../../../../../services/mentor/code-shuffle/code-shuffle.service';

import { parse } from 'acorn';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-code-shuffle-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './code-shuffle-create.html',
  styleUrl: './code-shuffle-create.css'
})
export class CodeShuffleCreate implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly codeShuffleService = inject(CodeShuffleService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly languages = signal<CodeShuffleLanguage[]>([]);
  readonly topics = signal<CodeShuffleTopic[]>([]);

  private readonly toastService = inject(ToastService);

  // Preview of the correct solution, split into code blocks.
  readonly previewBlocks = signal<string[]>([]);

  readonly taskForm = this.fb.group({
    title: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(150)
    ]),

    description: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(2000)
    ]),

    languageId: this.fb.nonNullable.control('', [
      Validators.required
    ]),

    difficulty: this.fb.nonNullable.control('easy', [
      Validators.required
    ]),

    maxMarks: this.fb.nonNullable.control(10, [
      Validators.required,
      Validators.min(1),
      Validators.max(100)
    ]),

    hintText: this.fb.nonNullable.control(''),

    publishDate: this.fb.nonNullable.control('', [
      Validators.required
    ]),

    dueDate: this.fb.nonNullable.control(''),

    topicIds: this.fb.nonNullable.control<number[]>([]),

    // Mentor enters the complete solution here.
    codeSolution: this.fb.nonNullable.control('', [
      Validators.required
    ])
  });

  ngOnInit(): void {
    this.loadFormOptions();
  }

  loadFormOptions(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.codeShuffleService.getFormOptions().subscribe({
      next: response => {
        this.languages.set(response.languages);
        this.topics.set(response.topics);
        this.loading.set(false);
      },

      error: (error: unknown) => {
        console.error(
          'Failed to load Code Shuffle options:',
          error
        );

        this.toastService.error(
  'Unable to load programming languages and topics.'
);

        this.loading.set(false);
      }
    });
  }

  
private splitSolutionIntoBlocks(solution: string): string[] {
  const source = solution.trim();

  if (!source) {
    return [];
  }

  try {
    const ast = parse(source, {
      ecmaVersion: 'latest',
      sourceType: 'script'
    });

    return ast.body.map((statement: any) =>
      source.slice(statement.start, statement.end).trim()
    ).filter(Boolean);
  } catch (error) {
    console.error('Unable to parse JavaScript solution:', error);

    return source
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);
  }
}

  // Split the solution into non-empty lines for preview.
  // This is a simple first version; multi-line statements
  // and nested code may need smarter block grouping later.
  generateBlockPreview(): void {
  const solution = this.taskForm.controls.codeSolution.value;

  this.previewBlocks.set(
    this.splitSolutionIntoBlocks(solution)
  );
}

  toggleTopic(topicId: number, checked: boolean): void {
    const selectedIds =
      this.taskForm.controls.topicIds.value;

    const updatedIds = checked
      ? [...new Set([...selectedIds, topicId])]
      : selectedIds.filter(id => id !== topicId);

    this.taskForm.controls.topicIds.setValue(updatedIds);
    this.taskForm.controls.topicIds.markAsTouched();
  }

  isTopicSelected(topicId: number): boolean {
    return this.taskForm.controls.topicIds.value.includes(topicId);
  }

  submitTask(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.taskForm.invalid) {
  this.taskForm.markAllAsTouched();
  this.toastService.error(
    'Please complete all required fields.'
  );
  return;
}

    const values = this.taskForm.getRawValue();

    const correctBlocks = this.splitSolutionIntoBlocks(
      values.codeSolution
    );

    if (correctBlocks.length < 2) {
  this.toastService.error(
    'Enter a solution containing at least two non-empty code blocks.'
  );
  return;
}

    const topicIds = values.topicIds;

    if (topicIds.length === 0) {
  this.toastService.error('Select at least one topic.');
  return;
}

   if (
  values.dueDate &&
  values.dueDate < values.publishDate
) {
  this.toastService.error(
    'The due date cannot be earlier than the publish date.'
  );
  return;
}

    // Backend expects correctBlocks as an array of strings.
    // Distractors are generated by the backend.
    const payload: CodeShuffleTaskPayload = {
      title: values.title.trim(),
      description: values.description.trim(),
      languageId: Number(values.languageId),
      difficulty: values.difficulty,
      maxMarks: values.maxMarks,
      hintText: values.hintText.trim(),
      publishDate: values.publishDate,
      dueDate: values.dueDate || null,
      topicIds,
      correctBlocks
    };

    this.saving.set(true);

    this.codeShuffleService.createTask(payload).subscribe({
      next: response => {
        this.saving.set(false);

        this.toastService.success(
  response.message || 'Draft task created successfully.'
);

        this.taskForm.reset({
          title: '',
          description: '',
          languageId: '',
          difficulty: 'easy',
          maxMarks: 10,
          hintText: '',
          publishDate: '',
          dueDate: '',
          topicIds: [],
          codeSolution: ''
        });

        this.previewBlocks.set([]);
      },

      error: (error: unknown) => {
  console.error(
    'Failed to create Code Shuffle task:',
    error
  );

  this.saving.set(false);

  const message =
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof error.error === 'object' &&
    error.error !== null &&
    'message' in error.error &&
    typeof error.error.message === 'string'
      ? error.error.message
      : 'Unable to create the task. Please check your entries and try again.';

  this.toastService.error(message);
}
    });
  }
}
