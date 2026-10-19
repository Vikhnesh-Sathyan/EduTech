
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  CheatsheetTechnologyService,
  CheatSheetTechnology
} from '../../../../services/admin/cheatsheet/cheatsheet-technology';

import {
  CheatsheetCategoryService,
  CheatSheetCategory
} from '../../../../services/admin/cheatsheet/cheatsheet-category';

import {
  CheatsheetTopicService,
  CheatSheetTopic,
  CheatSheetTopicForm
} from '../../../../services/admin/cheatsheet/cheatsheet-topic';

import { ToastService } from '../../../../services/toast.service';
import { ConfirmModalComponent } from '../../../../shared/confirm-modal/confirm-modal';

@Component({
  selector: 'app-topic-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmModalComponent
  ],
  templateUrl: './topic-management.html',
  styleUrl: './topic-management.css'
})
export class TopicManagementComponent implements OnInit {
  private technologyService = inject(CheatsheetTechnologyService);
  private categoryService = inject(CheatsheetCategoryService);
  private topicService = inject(CheatsheetTopicService);
  private toastService = inject(ToastService);

  technologies = signal<CheatSheetTechnology[]>([]);
  categories = signal<CheatSheetCategory[]>([]);
  topics = signal<CheatSheetTopic[]>([]);

  selectedTechnologyId = signal<number | null>(null);
  selectedCategoryId = signal<number | null>(null);

  loadingTechnologies = signal(false);
  loadingCategories = signal(false);
  loadingTopics = signal(false);
  saving = signal(false);
  deleting = signal(false);

  showForm = signal(false);
  editingTopicId = signal<number | null>(null);
  showDeleteModal = signal(false);

  selectedTopic: CheatSheetTopic | null = null;

  topicName = '';
  definition = '';
  codeExample = '';
  memoryTrick = '';
  expectedOutput = '';
  displayOrder = 1;

  ngOnInit(): void {
    this.loadTechnologies();
  }

  loadTechnologies(): void {
    this.loadingTechnologies.set(true);

    this.technologyService.getTechnologies().subscribe({
      next: (response) => {
        this.technologies.set(
          response.technologies.filter(
            technology => technology.status === 'active'
          )
        );
        this.loadingTechnologies.set(false);
      },
      error: (err) => {
        this.toastService.error(
          err.error?.message || 'Failed to load technologies.'
        );
        this.loadingTechnologies.set(false);
      }
    });
  }

  selectTechnology(value: string | number): void {
    const id = Number(value);

    this.selectedTechnologyId.set(
      Number.isInteger(id) && id > 0 ? id : null
    );

    this.selectedCategoryId.set(null);
    this.categories.set([]);
    this.topics.set([]);
    this.cancelForm();

    if (this.selectedTechnologyId() !== null) {
      this.loadCategories();
    }
  }

  loadCategories(): void {
    const technologyId = this.selectedTechnologyId();

    if (technologyId === null) return;

    this.loadingCategories.set(true);

    this.categoryService.getCategories(technologyId).subscribe({
      next: (response) => {
        this.categories.set(response.categories);
        this.loadingCategories.set(false);
      },
      error: (err) => {
        this.toastService.error(
          err.error?.message || 'Failed to load categories.'
        );
        this.loadingCategories.set(false);
      }
    });
  }

  selectCategory(value: string | number): void {
    const id = Number(value);

    this.selectedCategoryId.set(
      Number.isInteger(id) && id > 0 ? id : null
    );

    this.topics.set([]);
    this.cancelForm();

    if (this.selectedCategoryId() !== null) {
      this.loadTopics();
    }
  }

  loadTopics(): void {
    const categoryId = this.selectedCategoryId();

    if (categoryId === null) return;

    this.loadingTopics.set(true);

    this.topicService.getTopics(categoryId).subscribe({
      next: (response) => {
        this.topics.set(response.topics);
        this.loadingTopics.set(false);
      },
      error: (err) => {
        this.toastService.error(
          err.error?.message || 'Failed to load topics.'
        );
        this.loadingTopics.set(false);
      }
    });
  }

  openAddForm(): void {
    if (this.selectedCategoryId() === null) {
      this.toastService.error('Please select a category first.');
      return;
    }

    this.resetFields();
    this.displayOrder = this.topics().length + 1;
    this.editingTopicId.set(null);
    this.showForm.set(true);
  }

  editTopic(topic: CheatSheetTopic): void {
    this.topicName = topic.name;
    this.definition = topic.definition;
    this.codeExample = topic.code_example || '';
    this.memoryTrick = topic.memory_trick || '';
    this.expectedOutput = topic.expected_output || '';
    this.displayOrder = topic.display_order;

    this.editingTopicId.set(topic.id);
    this.showForm.set(true);
  }

  resetFields(): void {
    this.topicName = '';
    this.definition = '';
    this.codeExample = '';
    this.memoryTrick = '';
    this.expectedOutput = '';
    this.displayOrder = 1;
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingTopicId.set(null);
    this.resetFields();
  }

  saveTopic(): void {
    const categoryId = this.selectedCategoryId();
    const editingId = this.editingTopicId();
    const name = this.topicName.trim();
    const definition = this.definition.trim();

    if (categoryId === null) {
      this.toastService.error('Please select a category first.');
      return;
    }

    if (!name || !definition) {
      this.toastService.error('Topic name and definition are required.');
      return;
    }

    if (
      !Number.isInteger(Number(this.displayOrder)) ||
      Number(this.displayOrder) < 1
    ) {
      this.toastService.error(
        'Display order must be a positive whole number.'
      );
      return;
    }

    const data: CheatSheetTopicForm = {
      name,
      definition,
      code_example: this.codeExample.trim(),
      memory_trick: this.memoryTrick.trim(),
      expected_output: this.expectedOutput.trim(),
      display_order: Number(this.displayOrder)
    };

    this.saving.set(true);

    const request = editingId !== null
      ? this.topicService.updateTopic(editingId, data)
      : this.topicService.addTopic(categoryId, data);

    request.subscribe({
      next: (response) => {
        this.toastService.success(
          response.message || 'Topic saved successfully.'
        );
        this.saving.set(false);
        this.cancelForm();
        this.loadTopics();
      },
      error: (err) => {
        this.toastService.error(
          err.error?.message || 'Failed to save topic.'
        );
        this.saving.set(false);
      }
    });
  }

  openDeleteModal(topic: CheatSheetTopic): void {
    this.selectedTopic = topic;
    this.showDeleteModal.set(true);
  }

  cancelDelete(): void {
    if (this.deleting()) return;

    this.showDeleteModal.set(false);
    this.selectedTopic = null;
  }

  deleteTopic(): void {
    const topic = this.selectedTopic;

    if (!topic || this.deleting()) return;

    this.deleting.set(true);

    this.topicService.deleteTopic(topic.id).subscribe({
      next: (response) => {
        this.toastService.success(
          response.message || 'Topic deleted successfully.'
        );
        this.showDeleteModal.set(false);
        this.selectedTopic = null;
        this.deleting.set(false);
        this.loadTopics();
      },
      error: (err) => {
        this.toastService.error(
          err.error?.message ||
          'Failed to delete topic. It may contain subtopics.'
        );
        this.showDeleteModal.set(false);
        this.selectedTopic = null;
        this.deleting.set(false);
      }
    });
  }
}
