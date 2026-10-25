
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import {
  StudentTheoryQuiz,
  StudentTheoryQuizService
} from '../../../../../services/student/advanced/student-theory-quiz.service';

@Component({
  selector: 'app-student-theory-quiz-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quiz-list.html',
  styleUrl: './quiz-list.css'
})
export class QuizList implements OnInit {
  loading = signal(false);
  errorMessage = signal('');
  searchTerm = signal('');
  selectedDifficulty = signal('all');

  quizzes = signal<StudentTheoryQuiz[]>([]);

  filteredQuizzes = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const difficulty = this.selectedDifficulty();

    return this.quizzes().filter(quiz => {
      const matchesSearch =
        quiz.title.toLowerCase().includes(search) ||
        (quiz.description ?? '').toLowerCase().includes(search) ||
        (quiz.program_name ?? '').toLowerCase().includes(search) ||
        (quiz.department_name ?? '').toLowerCase().includes(search) ||
        (quiz.education_year_name ?? '').toLowerCase().includes(search) ||
        (quiz.subject_name ?? '').toLowerCase().includes(search);

      const matchesDifficulty =
        difficulty === 'all' ||
        (quiz.difficulty ?? '').toLowerCase() === difficulty;

      return matchesSearch && matchesDifficulty;
    });
  });

  constructor(
    private quizService: StudentTheoryQuizService
  ) {}

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.quizService.getPublishedQuizzes().subscribe({
      next: response => {
        console.log('Student theory quizzes:', response.quizzes);

        this.quizzes.set(response.quizzes ?? []);
        this.loading.set(false);
      },
      error: error => {
        console.error('Failed to load student quizzes:', error);

        this.errorMessage.set(
          error.error?.message ||
          'Unable to load theory quizzes. Please try again.'
        );

        this.loading.set(false);
      }
    });
  }

  trackByQuizId(
    _index: number,
    quiz: StudentTheoryQuiz
  ): number {
    return quiz.id;
  }
}
