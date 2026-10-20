
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

import {
  MentorCheatsheetSubtopic,
  MentorCheatsheetSubtopicService
} from '../../../../services/mentor/cheatsheet/mentor-cheatsheet-subtopic';

import { ConfirmModalComponent } from '../../../../shared/confirm-modal/confirm-modal';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-subtopic-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmModalComponent
  ],
  templateUrl: './subtopic-management.html',
  styleUrl: './subtopic-management.css'
})
export class SubtopicManagementComponent {
  private technologyService = inject(MentorCheatsheetTechnologyService);
  private selectionService = inject(MentorCheatsheetSelectionService);
  private categoryService = inject(MentorCheatsheetCategoryService);
  private topicService = inject(MentorCheatsheetTopicService);
  private subtopicService = inject(MentorCheatsheetSubtopicService);
  private toast = inject(ToastService);

  technologies = signal<MentorCheatsheetTechnology[]>([]);
  categories = signal<MentorCheatsheetCategory[]>([]);
  topics = signal<MentorCheatsheetTopic[]>([]);
  subtopics = signal<MentorCheatsheetSubtopic[]>([]);

  selectedTechnologyId = this.selectionService.selectedTechnologyId;
  selectedCategoryId = signal<number | null>(null);
  selectedTopicId = signal<number | null>(null);

  loadingTechnologies = signal(false);
  loadingCategories = signal(false);
  loadingTopics = signal(false);
  loadingSubtopics = signal(false);
  saving = signal(false);

  message = signal('');
  error = signal('');
  editingSubtopicId = signal<number | null>(null);

  showDeleteModal = signal(false);
  deletingSubtopic = signal<MentorCheatsheetSubtopic | null>(null);
  deleting = signal(false);

  subtopicName = '';
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
          this.subtopics.set([]);
          this.selectedCategoryId.set(null);
          this.selectedTopicId.set(null);
        }
      },
      error: (err) => {
        this.error.set(
          err.error?.message || 'Failed to load technologies.'
        );
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
      this.subtopics.set([]);
      this.selectedCategoryId.set(null);
      this.selectedTopicId.set(null);
      this.resetForm();
      return;
    }

    this.selectionService.selectTechnology(technologyId);
    this.categories.set([]);
    this.topics.set([]);
    this.subtopics.set([]);
    this.selectedCategoryId.set(null);
    this.selectedTopicId.set(null);
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
      },
      error: (err) => {
        const message =
          err.error?.message || 'Failed to load categories.';

        this.error.set(message);
        this.toast.error(message);
        this.loadingCategories.set(false);
      }
    });
  }

  selectCategory(categoryId: number | null): void {
    this.selectedCategoryId.set(categoryId);
    this.topics.set([]);
    this.subtopics.set([]);
    this.selectedTopicId.set(null);
    this.resetForm();
    this.message.set('');
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
        const message = err.error?.message || 'Failed to load topics.';

        this.error.set(message);
        this.toast.error(message);
        this.loadingTopics.set(false);
      }
    });
  }

  selectTopic(topicId: number | null): void {
    this.selectedTopicId.set(topicId);
    this.subtopics.set([]);
    this.resetForm();
    this.message.set('');
    this.error.set('');

    if (topicId !== null) {
      this.loadSubtopics();
    }
  }

  loadSubtopics(): void {
    const topicId = this.selectedTopicId();

    if (topicId === null) {
      this.subtopics.set([]);
      return;
    }

    this.loadingSubtopics.set(true);
    this.error.set('');

    this.subtopicService.getSubtopics(topicId).subscribe({
      next: (response) => {
        this.subtopics.set(response.subtopics);
        this.loadingSubtopics.set(false);
      },
      error: (err) => {
        const message =
          err.error?.message || 'Failed to load subtopics.';

        this.error.set(message);
        this.toast.error(message);
        this.loadingSubtopics.set(false);
      }
    });
  }

  saveSubtopic(): void {
    const topicId = this.selectedTopicId();
    const name = this.subtopicName.trim();
    const definition = this.definition.trim();

    if (topicId === null) {
      this.toast.error('Please select a topic.');
      return;
    }

    if (!name || !definition) {
      this.toast.error('Subtopic name and definition are required.');
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
    this.message.set('');
    this.error.set('');

    const isEditing = this.editingSubtopicId() !== null;

    const data = {
      name,
      definition,
      code_example: this.codeExample.trim() || null,
      memory_trick: this.memoryTrick.trim() || null,
      expected_output: this.expectedOutput.trim() || null,
      display_order: this.displayOrder
    };

    const request = isEditing
      ? this.subtopicService.updateSubtopic(
          this.editingSubtopicId()!,
          data
        )
      : this.subtopicService.createSubtopic(topicId, data);

    request.subscribe({
      next: (response) => {
        this.saving.set(false);
        this.resetForm();
        this.toast.success(
          response.message ||
          (isEditing
            ? 'Subtopic updated successfully.'
            : 'Subtopic created successfully.')
        );
        this.loadSubtopics();
      },
      error: (err) => {
        this.saving.set(false);

        const message =
          err.error?.message || 'Failed to save subtopic.';

        this.error.set(message);
        this.toast.error(message);
      }
    });
  }

  editSubtopic(subtopic: MentorCheatsheetSubtopic): void {
    this.editingSubtopicId.set(subtopic.id);
    this.subtopicName = subtopic.name;
    this.definition = subtopic.definition;
    this.codeExample = subtopic.code_example || '';
    this.memoryTrick = subtopic.memory_trick || '';
    this.expectedOutput = subtopic.expected_output || '';
    this.displayOrder = subtopic.display_order;

    this.message.set('');
    this.error.set('');
  }

  deleteSubtopic(subtopic: MentorCheatsheetSubtopic): void {
    this.deletingSubtopic.set(subtopic);
    this.showDeleteModal.set(true);
  }

  cancelDelete(): void {
    if (this.deleting()) {
      return;
    }

    this.showDeleteModal.set(false);
    this.deletingSubtopic.set(null);
  }

  confirmDelete(): void {
    const subtopic = this.deletingSubtopic();

    if (subtopic === null || this.deleting()) {
      return;
    }

    this.deleting.set(true);

    this.subtopicService.deleteSubtopic(subtopic.id).subscribe({
      next: (response) => {
        this.deleting.set(false);
        this.showDeleteModal.set(false);
        this.deletingSubtopic.set(null);

        if (this.editingSubtopicId() === subtopic.id) {
          this.resetForm();
        }

        this.toast.success(
          response.message || 'Subtopic deleted successfully.'
        );

        this.loadSubtopics();
      },
      error: (err) => {
        this.deleting.set(false);
        this.showDeleteModal.set(false);
        this.deletingSubtopic.set(null);

        this.toast.error(
          err.error?.message || 'Failed to delete subtopic.'
        );
      }
    });
  }

  resetForm(): void {
    this.subtopicName = '';
    this.definition = '';
    this.codeExample = '';
    this.memoryTrick = '';
    this.expectedOutput = '';
    this.displayOrder = 1;
    this.editingSubtopicId.set(null);
  }
}
