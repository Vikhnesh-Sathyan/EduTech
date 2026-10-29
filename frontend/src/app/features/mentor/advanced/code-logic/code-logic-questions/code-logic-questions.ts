import { CommonModule } from '@angular/common';

import {
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  untracked
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  CodeLogicAssessmentQuestion
} from '../../../../../services/mentor/advanced/code-logic/code-logic.service';

@Component({
  selector: 'app-code-logic-questions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './code-logic-questions.html',
  styleUrl: './code-logic-questions.css'
})
export class CodeLogicQuestions {

  // Assessment questions received from the parent.
  initialQuestions = input<CodeLogicAssessmentQuestion[]>([]);

  // Send updated questions to the parent.
  questionsChange = output<CodeLogicAssessmentQuestion[]>();

  // Local question state.
  questions = signal<CodeLogicAssessmentQuestion[]>([
    {
      question: '',
      expected_answer: '',
      marks: 5
    }
  ]);

  // Prevent the child's own emitted changes from resetting its state.
  private lastIncomingSignature = '';

  // Calculate total assessment marks.
  totalMarks = computed(() =>
    this.questions().reduce(
      (total, question) =>
        total + (Number(question.marks) || 0),
      0
    )
  );

  constructor() {
    effect(() => {
      const incoming = this.initialQuestions();

      const signature = JSON.stringify(incoming);

      // Ignore input values already represented by local state.
      if (signature === this.lastIncomingSignature) {
        return;
      }

      const normalized: CodeLogicAssessmentQuestion[] =
        incoming.length
          ? incoming.map(question => ({
              question: question.question ?? '',
              expected_answer: question.expected_answer ?? '',
              marks: Number(question.marks) || 5
            }))
          : [
              {
                question: '',
                expected_answer: '',
                marks: 5
              }
            ];

      untracked(() => {
        this.questions.set(normalized);
        this.lastIncomingSignature = signature;
      });
    });
  }

  // Add a new assessment question.
  addQuestion(): void {
    this.questions.update(questions => [
      ...questions,
      {
        question: '',
        expected_answer: '',
        marks: 5
      }
    ]);

    this.emitQuestions();
  }

  // Remove a question while keeping at least one.
  removeQuestion(index: number): void {
    if (this.questions().length <= 1) {
      return;
    }

    this.questions.update(questions =>
      questions.filter((_, questionIndex) =>
        questionIndex !== index
      )
    );

    this.emitQuestions();
  }

  // Update a question field.
  updateQuestion(
    index: number,
    field: keyof CodeLogicAssessmentQuestion,
    value: string | number
  ): void {
    this.questions.update(questions =>
      questions.map((question, questionIndex) =>
        questionIndex === index
          ? { ...question, [field]: value }
          : question
      )
    );

    this.emitQuestions();
  }

  // Send current questions to the parent.
  private emitQuestions(): void {
    const current = this.questions().map(question => ({
      ...question,
      marks: Number(question.marks)
    }));

    this.lastIncomingSignature = JSON.stringify(current);

    this.questionsChange.emit(current);
  }
}
