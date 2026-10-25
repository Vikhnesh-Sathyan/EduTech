
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import {
  StudentTheoryQuizService
} from '../../../../../services/student/advanced/student-theory-quiz.service';

@Component({
  selector: 'app-student-theory-quiz-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quiz-details.html',
  styleUrl: './quiz-details.css'
})
export class QuizDetails implements OnInit {
  loading = signal(false);
  errorMessage = signal('');
  quiz = signal<any | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: StudentTheoryQuizService
  ) {}

  ngOnInit(): void {
    const quizId = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(quizId) || quizId <= 0) {
      this.errorMessage.set('Invalid quiz ID.');
      return;
    }

    this.loadQuiz(quizId);
  }

  loadQuiz(quizId: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.quizService.getQuizById(quizId).subscribe({
    next: response => {
  console.log('Full quiz details response:', response);

  const quizData = response?.quiz ?? response;
  console.log('Quiz data used by page:', quizData);

  this.quiz.set(quizData);
  this.loading.set(false);
},
      error: error => {
        this.errorMessage.set(
          error.error?.message ||
          'Unable to load quiz details. Please try again.'
        );
        this.loading.set(false);
      }
    });
  }

  startQuiz(): void {
  const currentQuiz = this.quiz();

  if (currentQuiz?.id) {
    this.router.navigate([
      '/theory-quizzes',
      currentQuiz.id,
      'attempt'
    ]);
  }
}

  retryLoad(): void {
  const quizId = Number(this.route.snapshot.paramMap.get('id'));

  if (Number.isInteger(quizId) && quizId > 0) {
    this.loadQuiz(quizId);
  }
}
}
