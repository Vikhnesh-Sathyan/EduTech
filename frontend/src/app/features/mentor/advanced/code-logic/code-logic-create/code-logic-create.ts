import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  CodeLogicConcept,
  CodeLogicExample,
  CodeLogicLanguage,
  CodeLogicPredictionQuestion,
  CodeLogicAssessmentQuestion,
  CodeLogicProblemPayload,
  CodeLogicService
} from '../../../../../services/mentor/advanced/code-logic/code-logic.service';

import {
  CodeLogicQuestions
} from '../code-logic-questions/code-logic-questions';

@Component({
  selector: 'app-code-logic-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CodeLogicQuestions
  ],
  templateUrl: './code-logic-create.html',
  styleUrl: './code-logic-create.css'
})
export class CodeLogicCreate implements OnInit {

  languages: CodeLogicLanguage[] = [];
  concepts: CodeLogicConcept[] = [];

  loading = false;
  saving = false;

  // CSV IMPORT
  selectedCSVFile: File | null = null;
  importingCSV = false;

  csvImportResult: {
    imported: number;
    failed: number;
    errors: {
      row: number;
      title: string;
      message: string;
    }[];
  } | null = null;

  errorMessage = '';
  successMessage = '';

  problem = {
    title: '',
    description: '',
    languageId: null as number | null,
    mode: 'build_code' as 'build_code' | 'understand_code',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    maxMarks: 100,
    hintText: '',
    publishDate: '',
    dueDate: ''
  };

  content = {
    inputDescription: '',
    outputDescription: '',
    starterCode: '',
    solutionCode: '',

    examples: [
      { input: '', output: '', explanation: '' }
    ] as CodeLogicExample[],

    algorithmSteps: [''] as string[],

    predictionQuestions: [
      { question: '', expected_answer: '', marks: 2 }
    ] as CodeLogicPredictionQuestion[],

    flowData: null as unknown
  };

  // ASSESSMENT QUESTIONS
  assessmentQuestions: CodeLogicAssessmentQuestion[] = [
    {
      question: '',
      expected_answer: '',
      marks: 5
    }
  ];

  constructor(
    private codeLogicService: CodeLogicService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadLanguages();
    this.loadConcepts();
  }

  // LOAD AVAILABLE LANGUAGES
  loadLanguages(): void {
    this.codeLogicService.getLanguages().subscribe({
      next: response => {
        this.languages = response.languages ?? [];
      },
      error: () => {
        this.errorMessage =
          'Unable to load programming languages.';
      }
    });
  }

  // LOAD AVAILABLE CONCEPTS
  loadConcepts(): void {
    this.codeLogicService.getConcepts().subscribe({
      next: response => {
        this.concepts = response.concepts ?? [];
      },
      error: () => {
        this.errorMessage =
          'Unable to load concepts.';
      }
    });
  }

  // ADD AN EXAMPLE
  addExample(): void {
    this.content.examples.push({
      input: '',
      output: '',
      explanation: ''
    });
  }

  // REMOVE AN EXAMPLE
  removeExample(index: number): void {
    if (this.content.examples.length > 1) {
      this.content.examples.splice(index, 1);
    }
  }

  // ADD AN ALGORITHM STEP
  addAlgorithmStep(): void {
    this.content.algorithmSteps.push('');
  }

  // REMOVE AN ALGORITHM STEP
  removeAlgorithmStep(index: number): void {
    if (this.content.algorithmSteps.length > 1) {
      this.content.algorithmSteps.splice(index, 1);
    }
  }

  // ADD A PREDICTION QUESTION
  addPredictionQuestion(): void {
    this.content.predictionQuestions.push({
      question: '',
      expected_answer: '',
      marks: 2
    });
  }

  // REMOVE A PREDICTION QUESTION
  removePredictionQuestion(index: number): void {
    if (this.content.predictionQuestions.length > 1) {
      this.content.predictionQuestions.splice(index, 1);
    }
  }

  // RECEIVE ASSESSMENT QUESTIONS FROM CHILD COMPONENT
  onAssessmentQuestionsChange(
    questions: CodeLogicAssessmentQuestion[]
  ): void {
    this.assessmentQuestions = questions;
  }

  // SAVE PROBLEM AS DRAFT
  createProblem(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (
      !this.problem.title.trim() ||
      !this.problem.description.trim() ||
      !this.problem.languageId
    ) {
      this.errorMessage =
        'Please enter the title, description, and programming language.';
      return;
    }

    if (
      !Number.isFinite(this.problem.maxMarks) ||
      this.problem.maxMarks <= 0 ||
      this.problem.maxMarks > 99999.99
    ) {
      this.errorMessage =
        'Maximum marks must be greater than zero.';
      return;
    }

    if (
      this.problem.publishDate &&
      Number.isNaN(Date.parse(this.problem.publishDate))
    ) {
      this.errorMessage =
        'Please select a valid publish date.';
      return;
    }

    if (
      this.problem.dueDate &&
      Number.isNaN(Date.parse(this.problem.dueDate))
    ) {
      this.errorMessage =
        'Please select a valid due date and time.';
      return;
    }

    if (
      this.problem.publishDate &&
      this.problem.dueDate &&
      new Date(this.problem.dueDate).getTime() <
        new Date(this.problem.publishDate).getTime()
    ) {
      this.errorMessage =
        'The due date cannot be earlier than the publish date.';
      return;
    }

    const validExamples = this.content.examples
      .filter(example =>
        example.input.trim() || example.output.trim()
      )
      .map(example => ({
        input: example.input.trim(),
        output: example.output.trim(),
        explanation: example.explanation?.trim() || ''
      }));

    // THINK / PREDICTION QUESTIONS
    const validQuestions = this.content.predictionQuestions
      .filter(question => question.question.trim());

    if (
      this.problem.mode === 'understand_code' &&
      validQuestions.length === 0
    ) {
      this.errorMessage =
        'Add at least one prediction question for Understand Code mode.';
      return;
    }

    if (
      this.problem.mode === 'understand_code' &&
      validQuestions.some(
        question => !question.expected_answer.trim()
      )
    ) {
      this.errorMessage =
        'Enter the expected answer for every prediction question.';
      return;
    }

    if (
      this.problem.mode === 'understand_code' &&
      validQuestions.some(
        question =>
          !Number.isFinite(Number(question.marks)) ||
          Number(question.marks) <= 0
      )
    ) {
      this.errorMessage =
        'Each prediction question must have marks greater than zero.';
      return;
    }

    // ASSESSMENT QUESTIONS
    const validAssessmentQuestions = this.assessmentQuestions
      .filter(question => question.question.trim())
      .map(question => ({
        question: question.question.trim(),
        expected_answer: question.expected_answer.trim(),
        marks: Number(question.marks)
      }));

    if (
      this.assessmentQuestions.some(
        question =>
          question.question.trim() &&
          !question.expected_answer.trim()
      )
    ) {
      this.errorMessage =
        'Enter the expected answer for every assessment question.';
      return;
    }

    if (
      this.assessmentQuestions.some(
        question =>
          question.question.trim() &&
          (
            !Number.isInteger(Number(question.marks)) ||
            Number(question.marks) <= 0
          )
      )
    ) {
      this.errorMessage =
        'Each assessment question must have a positive whole-number mark.';
      return;
    }

    const assessmentTotal = validAssessmentQuestions.reduce(
      (total, question) => total + question.marks,
      0
    );

    if (assessmentTotal > this.problem.maxMarks) {
      this.errorMessage =
        `Assessment total (${assessmentTotal}) cannot exceed the problem's maximum marks (${this.problem.maxMarks}).`;
      return;
    }

    const payload: CodeLogicProblemPayload = {
      title: this.problem.title.trim(),
      description: this.problem.description.trim(),
      languageId: this.problem.languageId,
      mode: this.problem.mode,
      difficulty: this.problem.difficulty,
      maxMarks: this.problem.maxMarks,
      hintText: this.problem.hintText.trim() || null,

      // Send date-only values as date-only strings.
      publishDate: this.problem.publishDate || null,

      // Convert datetime-local to a MySQL-friendly datetime string.
      dueDate: this.problem.dueDate
        ? `${this.problem.dueDate.replace('T', ' ')}:00`
        : null,

      content: {
        inputDescription: this.content.inputDescription.trim(),
        outputDescription: this.content.outputDescription.trim(),
        examples: validExamples,
        starterCode: this.content.starterCode,
        solutionCode: this.content.solutionCode,

        algorithmSteps: this.content.algorithmSteps
          .map(step => step.trim())
          .filter(Boolean),

        flowData: this.content.flowData,

        // Existing Think prediction questions.
        predictionQuestions: validQuestions.map(question => ({
          question: question.question.trim(),
          expected_answer: question.expected_answer.trim(),
          marks: Number(question.marks)
        })),

        // Separate assessed questions.
        assessmentQuestions: validAssessmentQuestions
      }
    };

    this.saving = true;

    this.codeLogicService.createProblem(payload).subscribe({
      next: response => {
        this.saving = false;
        this.successMessage = response.message;
        this.router.navigate(['/mentor/advanced/code-logic']);
      },
      error: error => {
        this.saving = false;
        this.errorMessage =
          error.error?.message ||
          'Unable to create the problem. Please try again.';
      }
    });
  }

  // SELECT CSV FILE
  onCSVFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.errorMessage = '';
    this.successMessage = '';
    this.csvImportResult = null;

    if (!file) {
      this.selectedCSVFile = null;
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.selectedCSVFile = null;
      input.value = '';
      this.errorMessage = 'Please select a CSV file.';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.selectedCSVFile = null;
      input.value = '';
      this.errorMessage =
        'CSV file size must not exceed 2 MB.';
      return;
    }

    this.selectedCSVFile = file;
  }

  // IMPORT CSV PROBLEMS
  importCSVProblems(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.csvImportResult = null;

    if (!this.selectedCSVFile) {
      this.errorMessage =
        'Please select a CSV file first.';
      return;
    }

    this.importingCSV = true;

    this.codeLogicService
      .importProblemsFromCSV(this.selectedCSVFile)
      .subscribe({
        next: response => {
          this.importingCSV = false;
          this.csvImportResult = response;
          this.successMessage = response.message;

          if (response.imported > 0) {
            this.selectedCSVFile = null;
          }
        },
        error: error => {
          this.importingCSV = false;
          this.errorMessage =
            error.error?.message ||
            'Unable to import CSV. Please try again.';
        }
      });
  }

  // DOWNLOAD CSV TEMPLATE


downloadCSVTemplate(): void {
  const headers = [
    'title',
    'description',
    'language',
    'mode',
    'difficulty',
    'max_marks',
    'hint_text',
    'input_description',
    'output_description',
    'examples_json',
    'starter_code',
    'solution_code',
    'algorithm_steps_json',
    'prediction_questions_json',
    'publish_date',
    'due_date',

    // Assessment questions: ordinary CSV columns, not JSON.
    'assessment_question_1',
    'assessment_answer_1',
    'assessment_marks_1',
    'assessment_question_2',
    'assessment_answer_2',
    'assessment_marks_2',
    'assessment_question_3',
    'assessment_answer_3',
    'assessment_marks_3'
  ];

  // Keep the existing example problems and Think prediction questions.
  // Assessment fields are intentionally blank for mentors to fill in.
  const rows = [
    [
      'Check an Even Number',
      'Determine whether a number is even or odd.',
      'JavaScript',
      'build_code',
      'easy',
      '10',
      'Use the modulo operator.',
      'A single integer.',
      'Print Even or Odd.',
      JSON.stringify([
        { input: '4', output: 'Even' },
        { input: '5', output: 'Odd' }
      ]),
      '',
      'const n = 4;\nconsole.log(n % 2 === 0 ? "Even" : "Odd");',
      JSON.stringify([
        'Read the number.',
        'Check the remainder when divided by 2.',
        'Print the result.'
      ]),
      JSON.stringify([
        {
          question: 'What is 4 % 2?',
          options: ['0', '1', '2'],
          correctAnswer: '0'
        }
      ]),
      '',
      '',

      // Assessment question 1
      '',
      '',
      '',

      // Assessment question 2
      '',
      '',
      '',

      // Assessment question 3
      '',
      '',
      ''
    ],
    [
      'Find the Second Largest Number',
      'Find the second largest distinct number in an array.',
      'JavaScript',
      'build_code',
      'medium',
      '10',
      'Track the largest and second largest values.',
      'An array of integers.',
      'Print the second largest distinct number.',
      JSON.stringify([
        { input: '[10, 5, 8, 3]', output: '8' }
      ]),
      '',
      'const numbers = [10, 5, 8, 3];\nconst unique = [...new Set(numbers)].sort((a, b) => b - a);\nconsole.log(unique[1]);',
      JSON.stringify([
        'Initialize the largest values.',
        'Compare each number.',
        'Update the largest and second largest values.'
      ]),
      JSON.stringify([
        {
          question: 'What is the largest number in [10, 5, 8, 3]?',
          options: ['3', '5', '8', '10'],
          correctAnswer: '10'
        }
      ]),
      '',
      '',

      // Assessment question 1
      '',
      '',
      '',

      // Assessment question 2
      '',
      '',
      '',

      // Assessment question 3
      '',
      '',
      ''
    ]
  ];

  const escapeCSV = (value: unknown): string => {
    const text = value == null ? '' : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\r\n');

  const blob = new Blob(
    ['\uFEFF' + csvContent],
    { type: 'text/csv;charset=utf-8;' }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'logic_to_code_import_template.csv';
  link.click();

  URL.revokeObjectURL(url);
}



  // RETURN TO PROBLEM LIST
  cancel(): void {
    this.router.navigate([
      '/mentor/advanced/code-logic'
    ]);
  }
}
