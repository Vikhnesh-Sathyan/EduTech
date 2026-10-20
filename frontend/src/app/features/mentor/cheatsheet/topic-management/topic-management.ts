
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  MentorCheatsheetTechnology,
  MentorCheatsheetTechnologyService
} from '../../../../services/mentor/cheatsheet/mentor-cheatsheet-technology';

import {
  MentorCheatsheetSelectionService
} from '../../../../services/mentor/cheatsheet/mentor-cheatsheet-selection';

import {
  MentorCheatsheetCategory,
  MentorCheatsheetCategoryService
} from '../../../../services/mentor/cheatsheet/mentor-cheatsheet-category';

import {
  MentorCheatsheetTopic,
  MentorCheatsheetTopicService
} from '../../../../services/mentor/cheatsheet/mentor-cheatsheet-topic';

import { ToastService } from '../../../../services/toast.service';
import { ConfirmModalComponent } from '../../../../shared/confirm-modal/confirm-modal';

@Component({
  selector: 'app-topic-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './topic-management.html',
  styleUrl: './topic-management.css'
})
export class TopicManagementComponent {
  private technologyService = inject(MentorCheatsheetTechnologyService);
  private selectionService = inject(MentorCheatsheetSelectionService);
  private categoryService = inject(MentorCheatsheetCategoryService);
  private topicService = inject(MentorCheatsheetTopicService);
  private toast = inject(ToastService);

  technologies = signal<MentorCheatsheetTechnology[]>([]);
  categories = signal<MentorCheatsheetCategory[]>([]);
  topics = signal<MentorCheatsheetTopic[]>([]);

  selectedTechnologyId = this.selectionService.selectedTechnologyId;
  selectedCategoryId = signal<number | null>(null);

  loadingTechnologies = signal(false);
  loadingCategories = signal(false);
  loadingTopics = signal(false);
  saving = signal(false);
  deleting = signal(false);

  showDeleteModal = signal(false);
  deletingTopic = signal<MentorCheatsheetTopic | null>(null);

  error = signal('');
  editingTopicId = signal<number | null>(null);

  topicName = '';
  definition = '';
  codeExample = '';
  memoryTrick = '';
  expectedOutput = '';
  displayOrder = 1;

  constructor() {
    this.loadTechnologies();
  }

  loadTechnologies(): void {
    this.loadingTechnologies.set(true);
    this.error.set('');

    this.technologyService.getTechnologies().subscribe({
      next: (response) => {
        this.technologies.set(response.technologies);
        this.loadingTechnologies.set(false);

        const technologyId = this.selectedTechnologyId();

        if (
          technologyId !== null &&
          response.technologies.some(item => item.id === technologyId)
        ) {
          this.loadCategories();
        } else {
          this.categories.set([]);
          this.topics.set([]);
          this.selectedCategoryId.set(null);
        }
      },
      error: (err) => {
        this.toast.error(
          err.error?.message || 'Failed to load technologies.'
        );
        this.loadingTechnologies.set(false);
      }
    });
  }

  selectTechnology(technologyId: number | null): void {
    if (technologyId === null) {
      this.selectionService.clearSelection();
      this.categories.set([]);
      this.topics.set([]);
      this.selectedCategoryId.set(null);
      this.resetForm();
      return;
    }

    this.selectionService.selectTechnology(technologyId);
    this.categories.set([]);
    this.topics.set([]);
    this.selectedCategoryId.set(null);
    this.resetForm();
    this.loadCategories();
  }

  loadCategories(): void {
    const technologyId = this.selectedTechnologyId();

    if (technologyId === null) {
      this.categories.set([]);
      return;
    }

    this.loadingCategories.set(true);
    this.error.set('');

    this.categoryService.getCategories(technologyId).subscribe({
      next: (response) => {
        this.categories.set(response.categories);
        this.loadingCategories.set(false);

        const categoryId = this.selectedCategoryId();

        if (
          categoryId !== null &&
          response.categories.some(item => item.id === categoryId)
        ) {
          this.loadTopics();
        } else {
          this.selectedCategoryId.set(null);
          this.topics.set([]);
        }
      },
      error: (err) => {
        this.toast.error(
          err.error?.message || 'Failed to load categories.'
        );
        this.loadingCategories.set(false);
      }
    });
  }

  selectCategory(categoryId: number | null): void {
    this.selectedCategoryId.set(categoryId);
    this.topics.set([]);
    this.resetForm();
    this.error.set('');

    if (categoryId !== null) {
      this.loadTopics();
    }
  }

  loadTopics(): void {
    const categoryId = this.selectedCategoryId();

    if (categoryId === null) {
      this.topics.set([]);
      return;
    }

    this.loadingTopics.set(true);
    this.error.set('');

    this.topicService.getTopics(categoryId).subscribe({
      next: (response) => {
        this.topics.set(response.topics);
        this.loadingTopics.set(false);
      },
      error: (err) => {
        this.toast.error(
          err.error?.message || 'Failed to load topics.'
        );
        this.loadingTopics.set(false);
      }
    });
  }

  saveTopic(): void {
    const categoryId = this.selectedCategoryId();
    const name = this.topicName.trim();
    const definition = this.definition.trim();

    if (categoryId === null) {
      this.toast.error('Please select a category.');
      return;
    }

    if (!name || !definition) {
      this.toast.error('Topic name and definition are required.');
      return;
    }

    if (!Number.isInteger(this.displayOrder) || this.displayOrder < 1) {
      this.toast.error('Display order must be a positive integer.');
      return;
    }

    if (this.saving()) {
      return;
    }

    this.saving.set(true);
    this.error.set('');

    const isEditing = this.editingTopicId() !== null;

    const data = {
      name,
      definition,
      code_example: this.codeExample.trim() || null,
      memory_trick: this.memoryTrick.trim() || null,
      expected_output: this.expectedOutput.trim() || null,
      display_order: this.displayOrder
    };

    const request = isEditing
      ? this.topicService.updateTopic(this.editingTopicId()!, data)
      : this.topicService.createTopic(categoryId, data);

    request.subscribe({
      next: (response) => {
        this.toast.success(response.message);
        this.saving.set(false);
        this.resetForm();
        this.loadTopics();
      },
      error: (err) => {
        this.toast.error(
          err.error?.message || 'Failed to save topic.'
        );
        this.saving.set(false);
      }
    });
  }

  editTopic(topic: MentorCheatsheetTopic): void {
    this.editingTopicId.set(topic.id);
    this.topicName = topic.name;
    this.definition = topic.definition;
    this.codeExample = topic.code_example || '';
    this.memoryTrick = topic.memory_trick || '';
    this.expectedOutput = topic.expected_output || '';
    this.displayOrder = topic.display_order;
    this.error.set('');
  }

  deleteTopic(topic: MentorCheatsheetTopic): void {
    if (this.deleting()) {
      return;
    }

    this.deletingTopic.set(topic);
    this.showDeleteModal.set(true);
  }

  cancelDelete(): void {
    if (this.deleting()) {
      return;
    }

    this.showDeleteModal.set(false);
    this.deletingTopic.set(null);
  }

  confirmDelete(): void {
    const topic = this.deletingTopic();

    if (!topic || this.deleting()) {
      return;
    }

    this.deleting.set(true);

    this.topicService.deleteTopic(topic.id).subscribe({
      next: (response) => {
        this.toast.success(response.message);
        this.deleting.set(false);
        this.showDeleteModal.set(false);
        this.deletingTopic.set(null);

        if (this.editingTopicId() === topic.id) {
          this.resetForm();
        }

        this.loadTopics();
      },
      error: (err) => {
        this.toast.error(
          err.error?.message || 'Failed to delete topic.'
        );
        this.deleting.set(false);
        this.showDeleteModal.set(false);
        this.deletingTopic.set(null);
      }
    });
  }

  resetForm(): void {
    this.topicName = '';
    this.definition = '';
    this.codeExample = '';
    this.memoryTrick = '';
    this.expectedOutput = '';
    this.displayOrder = 1;
    this.editingTopicId.set(null);
  }
}
