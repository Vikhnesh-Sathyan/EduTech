import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

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

interface CodeShuffleTaskDetails {
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
}

interface CodeShuffleTaskResponse {
  task: CodeShuffleTaskDetails;
  topics: CodeShuffleTopic[];
  correctBlocks: CodeShuffleBlock[];
  distractorBlocks: CodeShuffleBlock[];
}

interface ProgrammingSubject {
  id: number;
  name: string;
}

@Component({
  selector: 'app-code-shuffle-edit',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './code-shuffle-edit.html',
  styleUrl: './code-shuffle-edit.css'
})
export class CodeShuffleEdit implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly codeShuffleService = inject(CodeShuffleService);
  private readonly toastService = inject(ToastService);

  taskId = 0;

  // Page state
  loading = signal(true);
  saving = signal(false);

  // Task details
  task = signal<CodeShuffleTaskDetails>({
    id: 0,
    title: '',
    description: '',
    language_id: 0,
    language_name: '',
    difficulty: 'easy',
    max_marks: 10,
    hint_text: '',
    publish_date: null,
    due_date: null,
    status: 'draft'
  });

  // Lists shown on the page
  topics = signal<CodeShuffleTopic[]>([]);
  languages = signal<ProgrammingSubject[]>([]);

  // Values the mentor edits
  correctBlocks = signal<string[]>([]);
  distractorBlocks = signal<string[]>([]);
  selectedTopicIds = signal<number[]>([]);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.toastService.error('Invalid task ID.');
      this.cancelEdit();
      return;
    }

    this.taskId = id;
    this.loadAvailableLanguages();
    this.loadTask();
  }

  loadTask(): void {
    this.loading.set(true);

    this.codeShuffleService.getTaskById(this.taskId).subscribe({
      next: (response: any) => {
        this.task.set({
          ...response.task,
          publish_date: this.formatDate(response.task.publish_date),
          due_date: this.formatDate(response.task.due_date)
        });

        // Keep the topics already assigned to this task selected.
        this.selectedTopicIds.set(
          (response.topics || []).map((topic: any) => Number(topic.id))
        );

        this.correctBlocks.set(
          (response.correctBlocks || []).map(
            (block: any) => block.block_content
          )
        );

        this.distractorBlocks.set(
          (response.distractorBlocks || []).map(
            (block: any) => block.block_content
          )
        );

        // Load all topics available to this mentor.
        this.codeShuffleService.getMyTopics().subscribe({
          next: (topicResponse: any) => {
            this.topics.set(topicResponse.topics || []);
            this.loading.set(false);

            if (this.task().status !== 'draft') {
              this.toastService.info('Only draft tasks can be edited.');
              this.cancelEdit();
            }
          },
          error: (error) => {
            this.toastService.error(
              error.error?.message || 'Failed to load your topics.'
            );
            this.loading.set(false);
          }
        });
      },
      error: (error) => {
        this.toastService.error(
          error.error?.message || 'Failed to load task details.'
        );
        this.loading.set(false);
      }
    });
  }

  loadAvailableLanguages(): void {
    this.codeShuffleService.getAvailableLanguages().subscribe({
      next: (response: any) => {
        this.languages.set(response.languages || []);
      },
      error: (error) => {
        this.toastService.error(
          error.error?.message || 'Failed to load programming subjects.'
        );
      }
    });
  }

  // Update ONE field of the task (title, description, difficulty, etc.)
  updateTask<K extends keyof CodeShuffleTaskDetails>(
    field: K,
    value: CodeShuffleTaskDetails[K]
  ): void {
    this.task.update(current => ({ ...current, [field]: value }));
  }

  // ---------- Correct blocks ----------

  addCorrectBlock(): void {
    this.correctBlocks.update(blocks => [...blocks, '']);
  }

  updateCorrectBlock(index: number, value: string): void {
    this.correctBlocks.update(blocks =>
      blocks.map((block, i) => (i === index ? value : block))
    );
  }

  removeCorrectBlock(index: number): void {
    if (this.correctBlocks().length <= 2) {
      this.toastService.info(
        'A task must contain at least two correct blocks.'
      );
      return;
    }

    this.correctBlocks.update(blocks =>
      blocks.filter((_, i) => i !== index)
    );
  }

  // ---------- Distractor blocks ----------

  addDistractorBlock(): void {
    this.distractorBlocks.update(blocks => [...blocks, '']);
  }

  updateDistractorBlock(index: number, value: string): void {
    this.distractorBlocks.update(blocks =>
      blocks.map((block, i) => (i === index ? value : block))
    );
  }

  removeDistractorBlock(index: number): void {
    this.distractorBlocks.update(blocks =>
      blocks.filter((_, i) => i !== index)
    );
  }

  // ---------- Topics ----------

  toggleTopic(topicId: number, checked: boolean): void {
    this.selectedTopicIds.update(ids => {
      if (checked) {
        return ids.includes(topicId) ? ids : [...ids, topicId];
      }
      return ids.filter(id => id !== topicId);
    });
  }

  isTopicSelected(topicId: number): boolean {
    return this.selectedTopicIds().includes(topicId);
  }

  // ---------- Save / cancel ----------

  saveChanges(): void {
    const task = this.task();
    const correctBlocks = this.correctBlocks();
    const distractorBlocks = this.distractorBlocks();
    const topicIds = this.selectedTopicIds();

    if (!task.title?.trim()) {
      this.toastService.error('Please enter a task title.');
      return;
    }

    if (!task.description?.trim()) {
      this.toastService.error('Please enter a task description.');
      return;
    }

    if (!task.language_id) {
      this.toastService.error('Please select a programming subject.');
      return;
    }

    if (!['easy', 'medium', 'hard'].includes(task.difficulty)) {
      this.toastService.error('Please select a valid difficulty.');
      return;
    }

    if (
      !Number.isFinite(Number(task.max_marks)) ||
      Number(task.max_marks) <= 0
    ) {
      this.toastService.error(
        'Maximum marks must be greater than zero.'
      );
      return;
    }

    if (topicIds.length === 0) {
      this.toastService.error('Select at least one topic.');
      return;
    }

    if (
      correctBlocks.length < 2 ||
      correctBlocks.some(block => !block.trim())
    ) {
      this.toastService.error(
        'Provide at least two non-empty correct code blocks.'
      );
      return;
    }

    if (distractorBlocks.some(block => !block.trim())) {
      this.toastService.error(
        'Remove empty distractor blocks or fill them in.'
      );
      return;
    }

    this.saving.set(true);

    const payload = {
      title: task.title.trim(),
      description: task.description.trim(),
      languageId: Number(task.language_id),
      difficulty: task.difficulty,
      maxMarks: Number(task.max_marks),
      hintText: task.hint_text || null,
      publishDate: task.publish_date || null,
      dueDate: task.due_date || null,
      topicIds: topicIds,
      correctBlocks: correctBlocks.map(block => block.trim()),
      distractorBlocks: distractorBlocks.map(block => block.trim())
    };

    this.codeShuffleService
      .updateTask(this.taskId, payload)
      .subscribe({
        next: (response) => {
          this.toastService.success(
            response.message || 'Task updated successfully.'
          );

          this.router.navigate([
            '/mentor/advanced/code-shuffle/my-tasks'
          ]);
        },
        error: (error) => {
          this.toastService.error(
            error.error?.message || 'Failed to update the task.'
          );

          this.saving.set(false);
        }
      });
  }

  cancelEdit(): void {
    this.router.navigate([
      '/mentor/advanced/code-shuffle/my-tasks'
    ]);
  }

  private formatDate(value: string | null): string | null {
    if (!value) {
      return null;
    }

    return value.substring(0, 10);
  }
}