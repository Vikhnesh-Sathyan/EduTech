import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { CodeShuffleService } from '../../../../../../services/mentor/code-shuffle/code-shuffle.service';
import { ToastService } from '../../../../../../services/toast.service';

interface CodeShuffleTopic {
  id: number;
  name: string;
  description: string | null;
}

interface CodeShuffleBlock {
  id: number;
  block_content: string;
  block_type: 'correct' | 'distractor';
  correct_position: number | null;
}

interface CodeShuffleTask {
  id: number;
  title: string;
  description: string;
  language_id: number;
  language_name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  max_marks: number;
  hint_text: string | null;
  publish_date: string | null;
  due_date: string | null;
  status: 'draft' | 'published' | 'unpublished';
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-code-shuffle-details',
  standalone: true,
  imports: [TitleCasePipe, DatePipe],
  templateUrl: './code-shuffle-details.html',
  styleUrl: './code-shuffle-details.css',
})
export class CodeShuffleDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly codeShuffleService = inject(CodeShuffleService);
  private readonly toastService = inject(ToastService);

  taskId = 0;

  // Page state (signals so the UI updates automatically)
  loading = signal(true);

  task = signal<CodeShuffleTask | null>(null);
  topics = signal<CodeShuffleTopic[]>([]);
  correctBlocks = signal<CodeShuffleBlock[]>([]);
  distractorBlocks = signal<CodeShuffleBlock[]>([]);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.toastService.error('Invalid task ID.');
      this.goBack();
      return;
    }

    this.taskId = id;
    this.loadTaskDetails();
  }

  loadTaskDetails(): void {
    this.loading.set(true);

    this.codeShuffleService.getTaskById(this.taskId).subscribe({
      next: (response: any) => {
        this.task.set(response.task);
        this.topics.set(response.topics || []);
        this.correctBlocks.set(response.correctBlocks || []);
        this.distractorBlocks.set(response.distractorBlocks || []);
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error(
          error.error?.message || 'Failed to load task details.'
        );

        this.loading.set(false);
      }
    });
  }

  getDifficultyClass(): string {
    return this.task()?.difficulty || 'easy';
  }

  goBack(): void {
    this.router.navigate([
      '/mentor/advanced/code-shuffle/my-tasks'
    ]);
  }

  editTask(): void {
    const task = this.task();

    if (!task) return;

    if (task.status !== 'draft') {
      this.toastService.info('Only draft tasks can be edited.');
      return;
    }

    this.router.navigate([
      '/mentor/advanced/code-shuffle/tasks',
      task.id,
      'edit'
    ]);
  }
}