import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import {
  StudentCodeShuffleTaskDetails,
  StudentCodeShuffleBlock,
  StudentCodeShuffleService
} from '../../../../../services/student/advanced/code-shuffle/student-code-shuffle.service';

import { ToastService } from '../../../../../services/toast.service';
@Component({
  selector: 'app-student-code-shuffle-task',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './code-shuffle-task.html',
  styleUrl: './code-shuffle-task.css'
})
export class StudentCodeShuffleTask implements OnInit, OnDestroy {

  loading = signal(false);
  submitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  task = signal<StudentCodeShuffleTaskDetails | null>(null);
  blocks = signal<StudentCodeShuffleBlock[]>([]);

  draggedIndex = signal<number | null>(null);
  hintsUsed = signal(0);
  timeTakenSeconds = signal(0);

  showHint = signal(false);
  submitted = signal(false);

  private taskId = 0;
  private timerId: ReturnType<typeof setInterval> | null = null;

  private timerStartedAt = 0;

  constructor(
    private route: ActivatedRoute,
    private codeShuffleService: StudentCodeShuffleService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage.set('Invalid Code Shuffle task ID.');
      return;
    }

    this.taskId = id;
    this.loadTask();
  }

 loadTask(): void {
  // Stop any existing timer
  if (this.timerId !== null) {
    clearInterval(this.timerId);
    this.timerId = null;
  }

  // Start this load with a fresh timer
  this.timeTakenSeconds.set(0);

  this.loading.set(true);
  this.errorMessage.set('');
  this.successMessage.set('');

  this.codeShuffleService.getPublishedTaskById(this.taskId).subscribe({
    next: response => {
      this.task.set(response.task);
      this.blocks.set(response.blocks ?? []);
      this.loading.set(false);

      this.startTimer();
    },
    error: error => {
      this.errorMessage.set(
        error.error?.message ||
        'Unable to load this challenge. Please try again.'
      );

      this.loading.set(false);
    }
  });
}

startTimer(): void {
  if (this.timerId !== null) {
    clearInterval(this.timerId);
    this.timerId = null;
  }

  const storageKey = `code-shuffle-start-${this.taskId}`;
  const savedStartTime = localStorage.getItem(storageKey);

  if (savedStartTime && !this.submitted()) {
    this.timerStartedAt = Number(savedStartTime);
  } else {
    this.timerStartedAt = Date.now();
    localStorage.setItem(storageKey, String(this.timerStartedAt));
  }

  this.updateElapsedTime();

  this.timerId = setInterval(() => {
    if (!this.submitted()) {
      this.updateElapsedTime();
    }
  }, 1000);
}

private updateElapsedTime(): void {
  if (!this.timerStartedAt) return;

  this.timeTakenSeconds.set(
    Math.floor((Date.now() - this.timerStartedAt) / 1000)
  );
}

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  }

  onDragStart(index: number): void {
    if (this.submitted() || this.submitting()) {
      return;
    }

    this.draggedIndex.set(index);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

onDrop(targetIndex: number): void {
  const sourceIndex = this.draggedIndex();

  if (
    sourceIndex === null ||
    sourceIndex === targetIndex
  ) {
    this.draggedIndex.set(null);
    return;
  }

  const updatedBlocks = [...this.blocks()];
  const [movedBlock] = updatedBlocks.splice(sourceIndex, 1);

  updatedBlocks.splice(targetIndex, 0, movedBlock);

  this.blocks.set(updatedBlocks);
  this.draggedIndex.set(null);

  this.saveCurrentBlockOrder();
}

moveBlock(index: number, direction: 'up' | 'down'): void {
  const updatedBlocks = [...this.blocks()];
  const targetIndex = direction === 'up' ? index - 1 : index + 1;

  if (
    targetIndex < 0 ||
    targetIndex >= updatedBlocks.length ||
    this.submitted() ||
    this.submitting()
  ) {
    return;
  }

  [updatedBlocks[index], updatedBlocks[targetIndex]] = [
    updatedBlocks[targetIndex],
    updatedBlocks[index]
  ];

  this.blocks.set(updatedBlocks);
  this.saveCurrentBlockOrder();
}

private saveCurrentBlockOrder(): void {
  const taskId = this.taskId;
  const currentOrder = this.blocks().map(block => block.id);

  if (!taskId || currentOrder.length < 2) {
    return;
  }

  this.codeShuffleService
    .saveActiveTaskOrder(taskId, currentOrder)
    .subscribe({
      next: () => {
        this.errorMessage.set('');
      },
      error: (error) => {
        console.error('Failed to save code block order:', error);

        this.errorMessage.set(
          error.error?.message ||
          'Failed to save the code order. Please try again.'
        );
      }
    });
}

  useHint(): void {
    const hint = this.task()?.hint_text;

    if (!hint) {
      return;
    }

    if (!this.showHint()) {
      this.hintsUsed.update(count => count + 1);
    }

    this.showHint.set(true);
  }

submitAnswer(): void {
  if (this.submitted() || this.submitting()) {
    return;
  }

  if (this.blocks().length === 0) {
    this.errorMessage.set('There are no code blocks to submit.');
    this.toastService.error('There are no code blocks to submit.');
    return;
  }

  this.submitting.set(true);
  this.errorMessage.set('');
  this.successMessage.set('');

  const submittedOrder = this.blocks().map(block => block.id);

  this.codeShuffleService.submitAttempt(this.taskId, {
    submittedOrder,
    hintsUsed: this.hintsUsed(),
    timeTakenSeconds: this.timeTakenSeconds()
  }).subscribe({
    next: response => {
      this.submitted.set(true);
      this.submitting.set(false);

      localStorage.removeItem(`code-shuffle-start-${this.taskId}`);

      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }

      const message =
        response.message || 'Answer submitted successfully.';

      this.successMessage.set(message);
      this.toastService.success(message);
    },

    error: error => {
      const message =
        error.error?.message ||
        'Unable to submit your answer. Please try again.';

      this.errorMessage.set(message);
      this.toastService.error(message);
      this.submitting.set(false);
    }
  });
}

  retryLoading(): void {
    this.loadTask();
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

resetChallenge(): void {
  const storageKey = `code-shuffle-start-${this.taskId}`;

  if (this.timerId !== null) {
    clearInterval(this.timerId);
    this.timerId = null;
  }

  // Remove the previous attempt's start time
  localStorage.removeItem(storageKey);

  // Reset challenge state
  this.timeTakenSeconds.set(0);
  this.hintsUsed.set(0);
  this.showHint.set(false);
  this.submitted.set(false);
  this.submitting.set(false);
  this.errorMessage.set('');
  this.successMessage.set('');
  this.draggedIndex.set(null);

  // Load the task and start a fresh timer
  this.loadTask();
}

}