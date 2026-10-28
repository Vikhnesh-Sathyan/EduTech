
import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import {
  StudentCodeLogicService
} from '../../../../../services/student/advanced/code-logic/code-logic.service';

interface StudentCodeLogicProblem {
  id: number;
  title: string;
  description: string;
  mode: 'build_code' | 'understand_code';
  difficulty: 'easy' | 'medium' | 'hard';
  max_marks: number;
  language_name?: string;
  publish_date?: string | null;
  due_date?: string | null;
}

@Component({
  selector: 'app-student-code-logic-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './code-logic-list.html',
  styleUrl: './code-logic-list.css'
})
export class StudentCodeLogicList implements OnInit {
  readonly problems = signal<StudentCodeLogicProblem[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly searchText = signal('');
  readonly selectedDifficulty = signal('all');

  readonly filteredProblems = computed(() => {
    const search = this.searchText().trim().toLowerCase();
    const difficulty = this.selectedDifficulty();

    return this.problems().filter(problem => {
      const matchesSearch =
        !search ||
        problem.title?.toLowerCase().includes(search) ||
        problem.description?.toLowerCase().includes(search) ||
        problem.language_name?.toLowerCase().includes(search);

      const matchesDifficulty =
        difficulty === 'all' ||
        problem.difficulty === difficulty;

      return matchesSearch && matchesDifficulty;
    });
  });

  constructor(
    private codeLogicService: StudentCodeLogicService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProblems();
  }

  loadProblems(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.codeLogicService.getPublishedProblems().subscribe({
      next: (response) => {
        const items = Array.isArray(response)
          ? response
          : response?.problems ??
            response?.data?.problems ??
            response?.data ??
            [];

        if (!Array.isArray(items)) {
          this.problems.set([]);
          this.errorMessage.set(
            'The server returned an unexpected problem list.'
          );
          this.loading.set(false);
          return;
        }

        this.problems.set(items);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Unable to load Logic to Code problems:', error);

        this.errorMessage.set(
          error.error?.message ??
          'Unable to load problems. Please try again.'
        );

        this.loading.set(false);
      }
    });
  }

  setSearch(value: string): void {
    this.searchText.set(value);
  }

  setDifficulty(value: string): void {
    this.selectedDifficulty.set(value);
  }

  getModeLabel(mode: string): string {
    return mode === 'understand_code'
      ? 'Code → Logic'
      : 'Logic → Code';
  }

  openProblem(problem: StudentCodeLogicProblem): void {
    this.router.navigate([
      '/student/advanced/code-logic',
      problem.id
    ]);
  }
}
