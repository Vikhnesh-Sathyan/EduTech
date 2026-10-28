
import { Component, OnInit, signal, computed } from '@angular/core';
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
  pass_percentage?: number;
  passed?: boolean;
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
  quizId = signal<number | null>(null);

  passPercentage = computed(() =>
    this.result()?.pass_percentage ?? 60
  );

  accuracy = computed(() => {
  const r = this.result();

    if (!r || r.attempted_questions <= 0) {
      return 0;
  }

  return Number(
    ((r.correct_answers / r.attempted_questions) * 100).toFixed(1)
  );
});

  passed = computed(() => {
    const r = this.result();

    if (!r) {
      return false;
    }

    return r.passed ?? r.percentage >= this.passPercentage();
  });

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

    this.quizId.set(quizId);

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

  retryQuiz(): void {
    const id = this.quizId();

    if (!id || this.passed()) {
      return;
    }

    this.router.navigate(['/theory-quizzes', id]);
  }

  backToQuizzes(): void {
    this.router.navigate(['/theory-quizzes']);
  }
}
