
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import {
  StudentCodeToLogicService,
  CodeToLogicTask
} from '../../../../../services/student/advanced/code-logic/student-code-to-logic.service';

@Component({
  selector: 'app-student-code-to-logic-task-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css'
})
export class StudentCodeToLogicTaskListComponent implements OnInit {
  private readonly codeToLogicService = inject(StudentCodeToLogicService);
  private readonly router = inject(Router);

  tasks = signal<CodeToLogicTask[]>([]);
  loading = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.codeToLogicService.getAvailableTasks().subscribe({
      next: response => {
        this.tasks.set(response.tasks ?? []);
        this.loading.set(false);
      },
      error: error => {
        console.error('Failed to load Code to Logic tasks:', error);

        this.errorMessage.set(
          error.error?.message ||
          'Unable to load available tasks. Please try again.'
        );

        this.loading.set(false);
      }
    });
  }

  openTask(task: CodeToLogicTask): void {
    this.router.navigate([
      '/student/advanced/code-to-logic/tasks',
      task.id
    ]);
  }
}
