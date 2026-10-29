
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { CodeToLogicService } from '../../../../../services/mentor/advanced/code-to-logic/code-to-logic.service';
import { ToastService } from '../../../../../services/toast.service';
import { ConfirmModalComponent } from '../../../../../shared/confirm-modal/confirm-modal';

interface CodeToLogicTask {
  id: number;
  title: string;
  description: string;
  subject_name: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
}

@Component({
  selector: 'app-code-to-logic-task-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ConfirmModalComponent
  ],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css'
})
export class TaskListComponent implements OnInit {
  private codeToLogicService = inject(CodeToLogicService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  tasks = signal<CodeToLogicTask[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  // DELETE CONFIRMATION MODAL
  deleteModalVisible = signal(false);
  selectedTaskId = signal<number | null>(null);
  deleting = signal(false);

  ngOnInit(): void {
    this.loadTasks();
  }

  // LOAD MENTOR TASKS
  loadTasks(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.codeToLogicService.getMyTasks().subscribe({
      next: (response: any) => {
        const taskList = Array.isArray(response)
          ? response
          : response?.tasks;

        this.tasks.set(taskList ?? []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load Code to Logic tasks:', error);

        this.errorMessage.set(
          'Unable to load tasks. Please try again.'
        );
        this.loading.set(false);
      }
    });
  }

  // CREATE TASK
  createTask(): void {
    this.router.navigate([
      '/mentor/advanced/code-to-logic/create'
    ]);
  }

  // VIEW TASK DETAILS
  viewTask(taskId: number): void {
    this.router.navigate([
      '/mentor/advanced/code-to-logic/tasks',
      taskId,
      'view'
    ]);
  }

  // EDIT TASK
  editTask(taskId: number): void {
    this.router.navigate([
      '/mentor/advanced/code-to-logic/tasks',
      taskId,
      'edit'
    ]);
  }

  // VIEW STUDENT SUBMISSIONS
  viewSubmissions(taskId: number): void {
    this.router.navigate([
      '/mentor/advanced/code-to-logic/tasks',
      taskId,
      'submissions'
    ]);
  }

  // PUBLISH DRAFT TASK
  publishTask(taskId: number): void {
    this.codeToLogicService.publishTask(taskId).subscribe({
      next: () => {
        this.loadTasks();
      },
      error: (error) => {
        console.error('Failed to publish task:', error);

        this.errorMessage.set(
          error.error?.message || 'Unable to publish this task.'
        );
      }
    });
  }

  // OPEN DELETE MODAL
  openDeleteModal(taskId: number): void {
    this.selectedTaskId.set(taskId);
    this.deleteModalVisible.set(true);
  }

  // CLOSE DELETE MODAL
  closeDeleteModal(): void {
    if (this.deleting()) {
      return;
    }

    this.deleteModalVisible.set(false);
    this.selectedTaskId.set(null);
  }

  // CONFIRM AND DELETE TASK
  confirmDelete(): void {
    const taskId = this.selectedTaskId();

    if (taskId === null || this.deleting()) {
      return;
    }

    this.deleting.set(true);

    this.codeToLogicService.deleteTask(taskId).subscribe({
      next: () => {
        this.tasks.update(tasks =>
          tasks.filter(task => task.id !== taskId)
        );

        this.deleting.set(false);
        this.deleteModalVisible.set(false);
        this.selectedTaskId.set(null);
      },
      error: (error) => {
        console.error('Failed to delete task:', error);

        this.deleting.set(false);

        this.errorMessage.set(
          error.error?.message || 'Unable to delete this task.'
        );
      }
    });
  }

  // SUMMARY COUNTS
  get totalTasks(): number {
    return this.tasks().length;
  }

  get publishedTasks(): number {
    return this.tasks().filter(
      task => task.status === 'published'
    ).length;
  }

  get draftTasks(): number {
    return this.tasks().filter(
      task => task.status === 'draft'
    ).length;
  }
}
