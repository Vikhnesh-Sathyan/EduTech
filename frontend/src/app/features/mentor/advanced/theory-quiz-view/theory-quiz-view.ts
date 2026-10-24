
import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  AdvancedTheoryQuizService,
  TheoryQuizDetails
} from '../../../../services/mentor/advanced/advanced-theory-quiz.service';

@Component({
  selector: 'app-theory-quiz-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './theory-quiz-view.html',
  styleUrl: './theory-quiz-view.css'
})
export class TheoryQuizView implements OnInit {

  // Component state
  quiz = signal<TheoryQuizDetails | null>(null);
  loading = signal(true);
  errorMessage = signal('');

  // Automatically calculates total marks when quiz changes
  totalMarks = computed(() =>
    this.quiz()?.questions.reduce(
      (total, question) => total + Number(question.marks || 0),
      0
    ) ?? 0
  );

  constructor(
    private route: ActivatedRoute,
    private quizService: AdvancedTheoryQuizService
  ) {}

  ngOnInit(): void {
    const quizId = Number(
      this.route.snapshot.paramMap.get('quizId')
    );

    if (!Number.isInteger(quizId) || quizId <= 0) {
      this.errorMessage.set('Invalid quiz ID.');
      this.loading.set(false);
      return;
    }

    this.loadQuiz(quizId);
  }

  loadQuiz(quizId: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.quizService.getMyQuizById(quizId).subscribe({
      next: (response) => {
        this.quiz.set(response.quiz);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load quiz:', error);

        this.errorMessage.set(
          error.error?.message || 'Unable to load this quiz.'
        );

        this.loading.set(false);
      }
    });
  }

  isCorrect(option: { is_correct: number | boolean }): boolean {
    return option.is_correct === 1 || option.is_correct === true;
  }

  trackQuestion(
    _index: number,
    question: { id: number }
  ): number {
    return question.id;
  }

  trackOption(
    _index: number,
    option: { id: number }
  ): number {
    return option.id;
  }
}
