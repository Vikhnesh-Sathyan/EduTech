import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import {
  StudentCodeShuffleAttempt,
  StudentCodeShuffleService,
  StudentCodeShuffleTask,
  StudentCodeShuffleTaskDetails
} from '../../../../../services/student/advanced/code-shuffle/student-code-shuffle.service';

@Component({
  selector: 'app-code-shuffle-progress',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './code-shuffle-progress.html',
  styleUrl: './code-shuffle-progress.css'
})
export class CodeShuffleProgress implements OnInit, OnDestroy {
  loading = signal(true);
  errorMessage = signal('');

  task = signal<StudentCodeShuffleTaskDetails | null>(null);
  attempts = signal<StudentCodeShuffleAttempt[]>([]);

  tasks = signal<StudentCodeShuffleTask[]>([]);
  isOverallProgress = signal(false);
  private taskId = 0;

  constructor(
    private route: ActivatedRoute,
    private codeShuffleService: StudentCodeShuffleService
  ) {}

ngOnInit(): void {
  const id = this.route.snapshot.paramMap.get('id');

  if (id === null) {
    this.isOverallProgress.set(true);
    this.loadOverallProgress();
    return;
  }

  this.isOverallProgress.set(false);
  this.taskId = Number(id);

  if (!Number.isInteger(this.taskId) || this.taskId <= 0) {
    this.errorMessage.set('Invalid Code Shuffle task ID.');
    this.loading.set(false);
    return;
  }

  this.loadProgress();
}

  loadProgress(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      taskResponse: this.codeShuffleService.getPublishedTaskById(this.taskId),
      attemptsResponse: this.codeShuffleService.getMyTaskAttempts(this.taskId)
    }).subscribe({
      next: ({ taskResponse, attemptsResponse }) => {
          console.log('Attempts API response:', attemptsResponse);
  console.log('Latest attempt:', attemptsResponse.attempts?.[0]);

        this.task.set(taskResponse.task);
        this.attempts.set(attemptsResponse.attempts ?? []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load Code Shuffle progress:', error);

        this.errorMessage.set(
          error.error?.message ||
          'Unable to load your progress. Please try again.'
        );

        this.loading.set(false);
      }
    });
  }

  get latestAttempt(): StudentCodeShuffleAttempt | null {
    return this.attempts()[0] ?? null;
  }

  get bestScore(): number {
    return Math.max(
      0,
      ...this.attempts().map(attempt => Number(attempt.score) || 0)
    );
  }

  get maxMarks(): number {
    return Number(
      this.latestAttempt?.max_marks ??
      this.task()?.max_marks ??
      0
    );
  }

  get scorePercentage(): number {
    if (this.maxMarks <= 0 || !this.latestAttempt) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        (Number(this.latestAttempt.score) / this.maxMarks) * 100
      )
    );
  }

  formatDuration(seconds: number): string {
    const total = Math.max(0, Number(seconds) || 0);
    const minutes = Math.floor(total / 60);
    const remainingSeconds = total % 60;

    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds
    ).padStart(2, '0')}`;
  }

  trackAttempt(
    _index: number,
    attempt: StudentCodeShuffleAttempt
  ): number {
    return attempt.id;
  }

  ngOnDestroy(): void {
    // No timer or subscription cleanup is needed for this page.
  }

  loadOverallProgress(): void {
  this.loading.set(true);
  this.errorMessage.set('');

  this.codeShuffleService.getPublishedTasks().subscribe({
    next: (response) => {
      this.tasks.set(response.tasks ?? []);
      this.loading.set(false);
    },
    error: (error) => {
      console.error('Failed to load overall progress:', error);

      this.errorMessage.set(
        error.error?.message ||
        'Unable to load your progress. Please try again.'
      );

      this.loading.set(false);
    }
  });
}
}