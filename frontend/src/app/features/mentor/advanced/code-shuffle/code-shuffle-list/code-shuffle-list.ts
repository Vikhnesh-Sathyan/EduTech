import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CodeShuffleService } from '../../../../../services/mentor/code-shuffle/code-shuffle.service';
import { ToastService } from '../../../../../services/toast.service';
import { ConfirmModalComponent } from '../../../../../shared/confirm-modal/confirm-modal';

interface CodeShuffleTask {
  id: number;
  title: string;
  description: string;
  language_name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  max_marks: number;
  publish_date: string | null;
  due_date: string | null;
  status: 'draft' | 'published' | 'unpublished';
  total_blocks: number;
  topic_count: number;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-code-shuffle-list',
  standalone: true,
  imports: [
  CommonModule,
  RouterModule,
  ConfirmModalComponent
],
  templateUrl: './code-shuffle-list.html',
  styleUrl: './code-shuffle-list.css'
})
export class CodeShuffleList implements OnInit {
  private readonly codeShuffleService = inject(CodeShuffleService);
  private readonly toastService = inject(ToastService);

  readonly tasks = signal<CodeShuffleTask[]>([]);
  readonly loading = signal(false);
  readonly actionTaskId = signal<number | null>(null);

  confirmDeleteVisible = false;
selectedTaskId: number | null = null;

openDeleteConfirmation(taskId: number): void {
  this.selectedTaskId = taskId;
  this.confirmDeleteVisible = true;
}

cancelDeleteConfirmation(): void {
  this.confirmDeleteVisible = false;
  this.selectedTaskId = null;
}

confirmDeleteTask(): void {
  if (this.selectedTaskId === null) {
    return;
  }

  const taskId = this.selectedTaskId;

  this.codeShuffleService.deleteTask(taskId).subscribe({
    next: (response) => {
      this.toastService.success(
        response.message || 'Task deleted successfully.'
      );

      this.cancelDeleteConfirmation();
      this.loadTasks();
    },
    error: (error) => {
      this.toastService.error(
        error.error?.message || 'Failed to delete task.'
      );

      this.cancelDeleteConfirmation();
    }
  });
}
  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading.set(true);

    this.codeShuffleService.getMyTasks().subscribe({
      next: response => {
        this.tasks.set(response.tasks ?? []);
        this.loading.set(false);
      },
      error: error => {
        console.error('Failed to load Code Shuffle tasks:', error);
        this.toastService.error('Unable to load your Code Shuffle tasks.');
        this.loading.set(false);
      }
    });
  }

  publishTask(task: CodeShuffleTask): void {
    this.actionTaskId.set(task.id);

    this.codeShuffleService.publishTask(task.id).subscribe({
      next: response => {
        this.toastService.success(
          response.message || 'Task published successfully.'
        );
        this.actionTaskId.set(null);
        this.loadTasks();
      },
      error: error => {
        console.error('Failed to publish task:', error);
        this.toastService.error(
          error?.error?.message || 'Unable to publish this task.'
        );
        this.actionTaskId.set(null);
      }
    });
  }

  unpublishTask(task: CodeShuffleTask): void {
    this.actionTaskId.set(task.id);

    this.codeShuffleService.unpublishTask(task.id).subscribe({
      next: response => {
        this.toastService.success(
          response.message || 'Task unpublished successfully.'
        );
        this.actionTaskId.set(null);
        this.loadTasks();
      },
      error: error => {
        console.error('Failed to unpublish task:', error);
        this.toastService.error(
          error?.error?.message || 'Unable to unpublish this task.'
        );
        this.actionTaskId.set(null);
      }
    });
  }

  deleteTask(task: CodeShuffleTask): void {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`
    );

    if (!confirmed) {
      return;
    }

    this.actionTaskId.set(task.id);

    this.codeShuffleService.deleteTask(task.id).subscribe({
      next: response => {
        this.toastService.success(
          response.message || 'Task deleted successfully.'
        );
        this.actionTaskId.set(null);
        this.loadTasks();
      },
      error: error => {
        console.error('Failed to delete task:', error);
        this.toastService.error(
          error?.error?.message || 'Unable to delete this task.'
        );
        this.actionTaskId.set(null);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'published':
        return 'status-published';
      case 'unpublished':
        return 'status-unpublished';
      default:
        return 'status-draft';
    }
  }
}