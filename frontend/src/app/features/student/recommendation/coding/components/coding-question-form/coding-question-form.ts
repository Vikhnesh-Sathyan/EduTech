
import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-coding-question-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coding-question-form.html',
  styleUrl: './coding-question-form.css'
})
export class CodingQuestionFormComponent {
  subjects = input<any[]>([]);
  loadingSubjects = input(false);

  closed = output<void>();

  submitQuestion = output<{
    title: string;
    subject_id: number;
    problem_statement: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    search_keywords: string;
    code: string;
  }>();

  title = signal('');
  subjectId = signal('');
  problemStatement = signal('');
  description = signal('');
  difficulty = signal<'beginner' | 'intermediate' | 'advanced'>('beginner');
  searchKeywords = signal('');
  code = signal('');

  onSubmit(): void {
    const title = this.title().trim();
    const subjectId = Number(this.subjectId());
    const problemStatement = this.problemStatement().trim();
    const code = this.code().trim();

    if (
      !title ||
      !Number.isInteger(subjectId) ||
      subjectId <= 0 ||
      !problemStatement ||
      !code
    ) {
      return;
    }

    this.submitQuestion.emit({
      title,
      subject_id: subjectId,
      problem_statement: problemStatement,
      description: this.description().trim(),
      difficulty: this.difficulty(),
      search_keywords: this.searchKeywords().trim(),
      code
    });
  }

  closeForm(): void {
    this.closed.emit();
  }
}
