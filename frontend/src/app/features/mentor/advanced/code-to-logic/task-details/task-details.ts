
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CodeToLogicService } from '../../../../../services/mentor/advanced/code-to-logic/code-to-logic.service';

interface CodeToLogicTaskDetails {
  id: number;
  subject_id: number;
  subject_name?: string;
  title: string;
  description: string;
  code_content: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-code-to-logic-task-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './task-details.html',
  styleUrl: './task-details.css'
})
export class TaskDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private codeToLogicService = inject(CodeToLogicService);

  task = signal<CodeToLogicTaskDetails | null>(null);
  loading = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {
    const taskId = Number(this.route.snapshot.paramMap.get('taskId'));

    if (!Number.isInteger(taskId) || taskId <= 0) {
      this.errorMessage.set('Invalid task ID.');
      this.loading.set(false);
      return;
    }

    this.loadTask(taskId);
  }

  loadTask(taskId: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.codeToLogicService.getTask(taskId).subscribe({
      next: (response) => {
        this.task.set(response.task);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load task details:', error);

        this.errorMessage.set(
          error.error?.message || 'Unable to load task details.'
        );

        this.loading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/mentor/advanced/code-to-logic/tasks']);
  }

  editTask(): void {
    const currentTask = this.task();

    if (!currentTask) {
      return;
    }

    this.router.navigate([
      '/mentor/advanced/code-to-logic/tasks',
      currentTask.id,
      'edit'
    ]);
  }

  viewSubmissions(): void {
    const currentTask = this.task();

    if (!currentTask) {
      return;
    }

    this.router.navigate([
      '/mentor/advanced/code-to-logic/tasks',
      currentTask.id,
      'submissions'
    ]);
  }
}
