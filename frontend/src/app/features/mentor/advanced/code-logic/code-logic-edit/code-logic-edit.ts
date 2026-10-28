import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CodeLogicService,
  CodeLogicLanguage,
  CodeLogicConcept,
  CodeLogicProblemPayload
} from '../../../../../services/mentor/advanced/code-logic/code-logic.service';

interface ProblemForm {
  title: string;
  description: string;
  languageId: number | null;
  mode: 'build_code' | 'understand_code';
  difficulty: 'easy' | 'medium' | 'hard';
  maxMarks: number;
  hintText: string;
  publishDate: string;
  dueDate: string;
}

interface ExampleItem {
  input: string;
  output: string;
  explanation: string;
}

interface PredictionQuestion {
  question: string;
  expected_answer: string;
  marks: number;
}

interface ContentForm {
  inputDescription: string;
  outputDescription: string;
  starterCode: string;
  solutionCode: string;
  examples: ExampleItem[];
  algorithmSteps: string[];
  predictionQuestions: PredictionQuestion[];
  flowData: unknown;
}

@Component({
  selector: 'app-code-logic-edit',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './code-logic-edit.html',
  styleUrl: './code-logic-edit.css'
})
export class CodeLogicEdit implements OnInit {
  problemId!: number;

  // Lists loaded from the backend
  languages = signal<CodeLogicLanguage[]>([]);
  concepts = signal<CodeLogicConcept[]>([]);

  // Page state
  loading = signal(true);
  saving = signal(false);

  errorMessage = signal('');
  successMessage = signal('');

  // Main problem details
  problem = signal<ProblemForm>({
    title: '',
    description: '',
    languageId: null,
    mode: 'build_code',
    difficulty: 'easy',
    maxMarks: 100,
    hintText: '',
    publishDate: '',
    dueDate: ''
  });

  // Problem content (examples, code, steps, questions)
  content = signal<ContentForm>({
    inputDescription: '',
    outputDescription: '',
    starterCode: '',
    solutionCode: '',
    examples: [
      { input: '', output: '', explanation: '' }
    ],
    algorithmSteps: [''],
    predictionQuestions: [
      { question: '', expected_answer: '', marks: 2 }
    ],
    flowData: null
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private codeLogicService: CodeLogicService
  ) {}

  ngOnInit(): void {
    this.problemId = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(this.problemId) || this.problemId <= 0) {
      this.errorMessage.set('Invalid problem ID.');
      this.loading.set(false);
      return;
    }

    this.loadLanguages();
    this.loadConcepts();
    this.loadProblem();
  }

  // ---------- Loading data ----------

  loadLanguages(): void {
    this.codeLogicService.getLanguages().subscribe({
      next: (response) => {
        this.languages.set(response.languages ?? []);
      },
      error: () => {
        this.errorMessage.set('Unable to load programming languages.');
      }
    });
  }

  loadConcepts(): void {
    this.codeLogicService.getConcepts().subscribe({
      next: (response) => {
        this.concepts.set(response.concepts ?? []);
      },
      error: () => {
        // Concepts are optional for loading the existing problem.
      }
    });
  }

  loadProblem(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.codeLogicService.getProblemById(this.problemId).subscribe({
      next: (response) => {
        const item = response.problem;

        if (!item) {
          this.errorMessage.set('Problem details were not found.');
          this.loading.set(false);
          return;
        }

        this.problem.set({
          title: item.title ?? '',
          description: item.description ?? '',
          languageId: item.language_id == null
            ? null
            : Number(item.language_id),
          mode: item.mode === 'understand_code'
            ? 'understand_code'
            : 'build_code',
          difficulty: item.difficulty ?? 'easy',
          maxMarks: Number(item.max_marks ?? 100),
          hintText: item.hint_text ?? '',
          publishDate: this.formatDate(item.publish_date, false),
          dueDate: this.formatDate(item.due_date, true)
        });

        this.content.set({
          inputDescription: item.input_description ?? '',
          outputDescription: item.output_description ?? '',
          starterCode: item.starter_code ?? '',
          solutionCode: item.solution_code ?? '',
          examples: this.parseArray<ExampleItem>(item.examples, [
            { input: '', output: '', explanation: '' }
          ]),
          algorithmSteps: this.parseArray<string>(
            item.algorithm_steps,
            ['']
          ),
          predictionQuestions: this.parseArray<PredictionQuestion>(
            item.prediction_questions,
            [{ question: '', expected_answer: '', marks: 2 }]
          ),
          flowData: this.parseJSON(item.flow_data)
        });

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

  private parseArray<T>(value: unknown, fallback: T[]): T[] {
    if (Array.isArray(value)) {
      return value.length ? value : fallback;
    }

    if (typeof value === 'string') {
      try {
        const parsed: unknown = JSON.parse(value);
        return Array.isArray(parsed) && parsed.length
          ? parsed as T[]
          : fallback;
      } catch {
        return fallback;
      }
    }

    return fallback;
  }

  private parseJSON(value: unknown): unknown {
    if (typeof value !== 'string') {
      return value ?? null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  private formatDate(
    value: string | null | undefined,
    includeTime: boolean
  ): string {
    if (!value) {
      return '';
    }

    const normalized = value.replace(' ', 'T');

    if (includeTime) {
      return normalized.length >= 16
        ? normalized.slice(0, 16)
        : normalized;
    }

    return normalized.slice(0, 10);
  }

  // ---------- Update helpers (used by the HTML inputs) ----------

  // Update ONE field of the problem (title, description, difficulty...)
  updateProblem<K extends keyof ProblemForm>(
    field: K,
    value: ProblemForm[K]
  ): void {
    this.problem.update(current => ({ ...current, [field]: value }));
  }

  // Update ONE simple field of the content (starterCode, solutionCode...)
  updateContent<K extends keyof ContentForm>(
    field: K,
    value: ContentForm[K]
  ): void {
    this.content.update(current => ({ ...current, [field]: value }));
  }

  // ---------- Examples ----------

  addExample(): void {
    this.content.update(current => ({
      ...current,
      examples: [
        ...current.examples,
        { input: '', output: '', explanation: '' }
      ]
    }));
  }

  updateExample<K extends keyof ExampleItem>(
    index: number,
    field: K,
    value: ExampleItem[K]
  ): void {
    this.content.update(current => ({
      ...current,
      examples: current.examples.map((example, i) =>
        i === index ? { ...example, [field]: value } : example
      )
    }));
  }

  removeExample(index: number): void {
    if (this.content().examples.length <= 1) {
      return;
    }

    this.content.update(current => ({
      ...current,
      examples: current.examples.filter((_, i) => i !== index)
    }));
  }

  // ---------- Algorithm steps ----------

  addAlgorithmStep(): void {
    this.content.update(current => ({
      ...current,
      algorithmSteps: [...current.algorithmSteps, '']
    }));
  }

  updateAlgorithmStep(index: number, value: string): void {
    this.content.update(current => ({
      ...current,
      algorithmSteps: current.algorithmSteps.map((step, i) =>
        i === index ? value : step
      )
    }));
  }

  removeAlgorithmStep(index: number): void {
    if (this.content().algorithmSteps.length <= 1) {
      return;
    }

    this.content.update(current => ({
      ...current,
      algorithmSteps: current.algorithmSteps.filter((_, i) => i !== index)
    }));
  }

  // ---------- Prediction questions ----------

  addPredictionQuestion(): void {
    this.content.update(current => ({
      ...current,
      predictionQuestions: [
        ...current.predictionQuestions,
        { question: '', expected_answer: '', marks: 2 }
      ]
    }));
  }

  updatePredictionQuestion<K extends keyof PredictionQuestion>(
    index: number,
    field: K,
    value: PredictionQuestion[K]
  ): void {
    this.content.update(current => ({
      ...current,
      predictionQuestions: current.predictionQuestions.map((question, i) =>
        i === index ? { ...question, [field]: value } : question
      )
    }));
  }

  removePredictionQuestion(index: number): void {
    if (this.content().predictionQuestions.length <= 1) {
      return;
    }

    this.content.update(current => ({
      ...current,
      predictionQuestions: current.predictionQuestions.filter(
        (_, i) => i !== index
      )
    }));
  }

  // ---------- Save / cancel ----------

  saveChanges(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    const problem = this.problem();
    const content = this.content();

    if (!problem.title.trim()) {
      this.errorMessage.set('Please enter a problem title.');
      return;
    }

    if (!problem.description.trim()) {
      this.errorMessage.set('Please enter a problem description.');
      return;
    }

    if (!problem.languageId) {
      this.errorMessage.set('Please select a programming language.');
      return;
    }

    if (
      !Number.isFinite(problem.maxMarks) ||
      problem.maxMarks <= 0 ||
      problem.maxMarks > 99999.99
    ) {
      this.errorMessage.set('Maximum marks must be greater than 0.');
      return;
    }

    if (
      problem.publishDate &&
      problem.dueDate &&
      problem.dueDate < problem.publishDate
    ) {
      this.errorMessage.set(
        'Due date must not be earlier than publish date.'
      );
      return;
    }

    if (problem.mode === 'understand_code') {
      const validQuestions = content.predictionQuestions.some(
        question =>
          question.question.trim() &&
          question.expected_answer.trim() &&
          question.marks > 0
      );

      if (!validQuestions) {
        this.errorMessage.set(
          'Code → Logic requires at least one complete prediction question.'
        );
        return;
      }
    }

    const payload: CodeLogicProblemPayload = {
      title: problem.title.trim(),
      description: problem.description.trim(),
      languageId: problem.languageId,
      mode: problem.mode,
      difficulty: problem.difficulty,
      maxMarks: problem.maxMarks,
      hintText: problem.hintText.trim() || null,
      publishDate: problem.publishDate || null,
      dueDate: problem.dueDate
        ? problem.dueDate.replace('T', ' ') + ':00'
        : null,
      content: {
        inputDescription: content.inputDescription,
        outputDescription: content.outputDescription,
        examples: content.examples.filter(
          example => example.input.trim() || example.output.trim()
        ),
        starterCode: content.starterCode,
        solutionCode: content.solutionCode,
        algorithmSteps: content.algorithmSteps.filter(
          step => step.trim()
        ),
        flowData: content.flowData,
        predictionQuestions: content.predictionQuestions.filter(
          question => question.question.trim()
        )
      }
    };

    this.saving.set(true);

    this.codeLogicService.updateProblem(this.problemId, payload).subscribe({
      next: (response) => {
        this.saving.set(false);
        this.successMessage.set(
          response.message || 'Problem updated successfully.'
        );

        this.router.navigate([
          '/mentor/advanced/code-logic'
        ]);
      },
      error: (error) => {
        this.saving.set(false);
        this.errorMessage.set(
          error.error?.message ?? 'Unable to update the problem.'
        );
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/mentor/advanced/code-logic']);
  }
}