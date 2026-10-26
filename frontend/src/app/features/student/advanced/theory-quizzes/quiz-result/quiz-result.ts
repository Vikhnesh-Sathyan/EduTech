import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentTheoryQuizService } from '../../../../../services/student/advanced/student-theory-quiz.service';

interface TheoryQuizResult {
  id: number;
  attempt_number: number;
  status: string;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  score: number;
  total_marks: number;
  percentage: number;
  started_at: string;
  completed_at: string | null;
  attempted_questions: number;
  not_attempted_questions: number;
}

@Component({
  selector: 'app-quiz-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-result.html',
  styleUrl: './quiz-result.css'
})
export class QuizResult implements OnInit {
  loading = signal(true);
  error = signal('');
  result = signal<TheoryQuizResult | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: StudentTheoryQuizService
  ) {}

  ngOnInit(): void {
    const quizId = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(quizId) || quizId <= 0) {
      this.error.set('Invalid quiz ID.');
      this.loading.set(false);
      return;
    }

    this.quizService.getAttemptStatus(quizId).subscribe({
      next: (response: any) => {
        const attempt = response?.attempt;

        if (!attempt || attempt.status !== 'completed') {
          this.error.set('No completed quiz result was found.');
          this.loading.set(false);
          return;
        }

        this.result.set(attempt as TheoryQuizResult);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load quiz result:', err);
        this.error.set(
          err?.error?.message || 'Could not load your quiz result.'
        );
        this.loading.set(false);
      }
    });
  }

  backToQuizzes(): void {
    this.router.navigate(['/theory-quizzes']);
  }
}