import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import {
  StudentCodeShuffleTask,
  StudentCodeShuffleService
} from '../../../../../services/student/advanced/code-shuffle/student-code-shuffle.service';

@Component({
  selector: 'app-student-code-shuffle-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './code-shuffle-list.html',
  styleUrl: './code-shuffle-list.css'
})
export class StudentCodeShuffleList implements OnInit {
  loading = signal(false);
  errorMessage = signal('');
  searchTerm = signal('');
  selectedDifficulty = signal('all');

  tasks = signal<StudentCodeShuffleTask[]>([]);

  filteredTasks = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const difficulty = this.selectedDifficulty();

    return this.tasks().filter(task => {
      const matchesSearch =
        task.title.toLowerCase().includes(search) ||
        (task.description ?? '').toLowerCase().includes(search) ||
        (task.language_name ?? '').toLowerCase().includes(search) ||
        (task.topics ?? '').toLowerCase().includes(search);

      const matchesDifficulty =
        difficulty === 'all' ||
        (task.difficulty ?? '').toLowerCase() === difficulty;

      return matchesSearch && matchesDifficulty;
    });
  });

  constructor(
    private codeShuffleService: StudentCodeShuffleService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.codeShuffleService.getPublishedTasks().subscribe({
      next: response => {
        this.tasks.set(response.tasks ?? []);
        this.loading.set(false);
      },
      error: error => {
        this.errorMessage.set(
          error.error?.message ||
          'Unable to load Code Shuffle tasks. Please try again.'
        );

        this.loading.set(false);
      }
    });
  }

  trackByTaskId(
    _index: number,
    task: StudentCodeShuffleTask
  ): number {
    return task.id;
  }

  getDifficultyClass(difficulty: string): string {
    switch ((difficulty ?? '').toLowerCase()) {
      case 'easy':
        return 'difficulty-easy';
      case 'medium':
        return 'difficulty-medium';
      case 'hard':
        return 'difficulty-hard';
      default:
        return 'difficulty-default';
    }
  }

  getProgressLabel(task: StudentCodeShuffleTask): string {
    if (task.progress_status === 'completed') {
      return 'Completed';
    }

    if ((task.attempt_count ?? 0) > 0) {
      return 'In Progress';
    }

    return 'Not Started';
  }

  retryLoading(): void {
    this.loadTasks();
  }
}