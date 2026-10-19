
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
  CheatSheetTopic
} from '../../../../services/admin/cheatsheet/cheatsheet-topic';

import {
  CheatsheetSubtopicService,
  CheatSheetSubtopic,
  CheatSheetSubtopicForm
} from '../../../../services/admin/cheatsheet/cheatsheet-subtopic';

import { ToastService } from '../../../../services/toast.service';
import { ConfirmModalComponent } from '../../../../shared/confirm-modal/confirm-modal';

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
export class SubtopicManagementComponent implements OnInit {
  private technologyService = inject(CheatsheetTechnologyService);
  private categoryService = inject(CheatsheetCategoryService);
  private topicService = inject(CheatsheetTopicService);
  private subtopicService = inject(CheatsheetSubtopicService);
  private toastService = inject(ToastService);

  technologies = signal<CheatSheetTechnology[]>([]);
  categories = signal<CheatSheetCategory[]>([]);
  topics = signal<CheatSheetTopic[]>([]);
  subtopics = signal<CheatSheetSubtopic[]>([]);

  selectedTechnologyId = signal<number | null>(null);
  selectedCategoryId = signal<number | null>(null);
  selectedTopicId = signal<number | null>(null);

  loadingTechnologies = signal(false);
  loadingCategories = signal(false);
  loadingTopics = signal(false);
  loadingSubtopics = signal(false);
  saving = signal(false);
  deleting = signal(false);

  showForm = signal(false);
  editingSubtopicId = signal<number | null>(null);
  showDeleteModal = signal(false);

  selectedSubtopic: CheatSheetSubtopic | null = null;

  subtopicName = '';
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
    this.selectedTopicId.set(null);
    this.categories.set([]);
    this.topics.set([]);
    this.subtopics.set([]);
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

    this.selectedTopicId.set(null);
    this.topics.set([]);
    this.subtopics.set([]);
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

  selectTopic(value: string | number): void {
    const id = Number(value);

    this.selectedTopicId.set(
      Number.isInteger(id) && id > 0 ? id : null
    );

    this.subtopics.set([]);
    this.cancelForm();

    if (this.selectedTopicId() !== null) {
      this.loadSubtopics();
    }
  }

  loadSubtopics(): void {
    const topicId = this.selectedTopicId();
    if (topicId === null) return;

    this.loadingSubtopics.set(true);

    this.subtopicService.getSubtopics(topicId).subscribe({
      next: (response) => {
        this.subtopics.set(response.subtopics);
        this.loadingSubtopics.set(false);
      },
      error: (err) => {
        this.toastService.error(
          err.error?.message || 'Failed to load subtopics.'
        );
        this.loadingSubtopics.set(false);
      }
    });
  }

  openAddForm(): void {
    if (this.selectedTopicId() === null) {
      this.toastService.error('Please select a topic first.');
      return;
    }

    this.resetFields();
    this.displayOrder = this.subtopics().length + 1;
    this.editingSubtopicId.set(null);
    this.showForm.set(true);
  }

  editSubtopic(subtopic: CheatSheetSubtopic): void {
    this.subtopicName = subtopic.name;
    this.definition = subtopic.definition;
    this.codeExample = subtopic.code_example || '';
    this.memoryTrick = subtopic.memory_trick || '';
    this.expectedOutput = subtopic.expected_output || '';
    this.displayOrder = subtopic.display_order;

    this.editingSubtopicId.set(subtopic.id);
    this.showForm.set(true);
  }

  resetFields(): void {
    this.subtopicName = '';
    this.definition = '';
    this.codeExample = '';
    this.memoryTrick = '';
    this.expectedOutput = '';
    this.displayOrder = 1;
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingSubtopicId.set(null);
    this.resetFields();
  }

  saveSubtopic(): void {
    const topicId = this.selectedTopicId();
    const editingId = this.editingSubtopicId();
    const name = this.subtopicName.trim();
    const definition = this.definition.trim();

    if (topicId === null) {
      this.toastService.error('Please select a topic first.');
      return;
    }

    if (!name || !definition) {
      this.toastService.error(
        'Subtopic name and definition are required.'
      );
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

    const data: CheatSheetSubtopicForm = {
      name,
      definition,
      code_example: this.codeExample.trim(),
      memory_trick: this.memoryTrick.trim(),
      expected_output: this.expectedOutput.trim(),
      display_order: Number(this.displayOrder)
    };

    this.saving.set(true);

    const request = editingId !== null
      ? this.subtopicService.updateSubtopic(editingId, data)
      : this.subtopicService.addSubtopic(topicId, data);

    request.subscribe({
      next: (response) => {
        this.toastService.success(
          response.message || 'Subtopic saved successfully.'
        );
        this.saving.set(false);
        this.cancelForm();
        this.loadSubtopics();
      },
      error: (err) => {
        this.toastService.error(
          err.error?.message || 'Failed to save subtopic.'
        );
        this.saving.set(false);
      }
    });
  }

  openDeleteModal(subtopic: CheatSheetSubtopic): void {
    this.selectedSubtopic = subtopic;
    this.showDeleteModal.set(true);
  }

  cancelDelete(): void {
    if (this.deleting()) return;

    this.showDeleteModal.set(false);
    this.selectedSubtopic = null;
  }

  deleteSubtopic(): void {
    const subtopic = this.selectedSubtopic;

    if (!subtopic || this.deleting()) return;

    this.deleting.set(true);

    this.subtopicService.deleteSubtopic(subtopic.id).subscribe({
      next: (response) => {
        this.toastService.success(
          response.message || 'Subtopic deleted successfully.'
        );
        this.showDeleteModal.set(false);
        this.selectedSubtopic = null;
        this.deleting.set(false);
        this.loadSubtopics();
      },
      error: (err) => {
        this.toastService.error(
          err.error?.message || 'Failed to delete subtopic.'
        );
        this.showDeleteModal.set(false);
        this.selectedSubtopic = null;
        this.deleting.set(false);
      }
    });
  }
}
