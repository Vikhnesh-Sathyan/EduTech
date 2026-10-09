import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import { FormsModule } from '@angular/forms';

import { AdminProjectService } from '../../../../services/admin/admin-project.service';


@Component({
  selector: 'app-project-topics',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './project-topics.html',
  styleUrl: './project-topics.css'
})
export class ProjectTopics implements OnInit {

  // =====================================================
  // CATEGORY
  // =====================================================

  categoryId!: number;


  // =====================================================
  // TOPICS
  // =====================================================

  // Store topics received from the backend
  topics = signal<any[]>([]);


  // =====================================================
  // ADD TOPIC
  // =====================================================

  showAddForm = false;

  newTopic = {
    name: '',
    description: '',
    display_order: 1
  };


  // =====================================================
  // EDIT TOPIC
  // =====================================================

  editingTopicId: number | null = null;

  editTopic = {
    name: '',
    description: '',
    display_order: 1,
    status: 'active'
  };


  constructor(
    private route: ActivatedRoute,
    private adminProjectService: AdminProjectService
  ) {}


  // =====================================================
  // INITIALIZE PAGE
  // =====================================================

  ngOnInit(): void {

    this.categoryId = Number(
      this.route.snapshot.paramMap.get('categoryId')
    );

    this.loadTopics();

  }


  // =====================================================
  // LOAD TOPICS
  // =====================================================

  // Load topics belonging to the selected category
  loadTopics(): void {

    this.adminProjectService
      .getTopics(this.categoryId)
      .subscribe({

        next: (response: any) => {

          const topics = Array.isArray(response)
            ? response
            : response.topics || [];

          this.topics.set(topics);

        },

        error: (error) => {

          console.error(
            'Failed to load project topics:',
            error
          );

        }

      });

  }


  // =====================================================
  // CREATE TOPIC
  // =====================================================

  // Create a new topic
  createTopic(): void {

    if (
      !this.newTopic.name.trim() ||
      !this.newTopic.display_order
    ) {
      return;
    }

    this.adminProjectService
      .createTopic(
        this.categoryId,
        this.newTopic
      )
      .subscribe({

        next: () => {

          this.showAddForm = false;

          this.newTopic = {
            name: '',
            description: '',
            display_order: 1
          };

          this.loadTopics();

        },

        error: (error) => {

          console.error(
            'Failed to create project topic:',
            error
          );

        }

      });

  }


  // =====================================================
  // START EDIT
  // =====================================================

  // Load topic data into the edit form
  startEditTopic(topic: any): void {

    this.editingTopicId = topic.id;

    this.editTopic = {
      name: topic.name,
      description: topic.description || '',
      display_order: topic.display_order,
      status: topic.status || 'active'
    };

  }


  // =====================================================
  // CANCEL EDIT
  // =====================================================

  // Close the edit form
  cancelEditTopic(): void {

    this.editingTopicId = null;

    this.editTopic = {
      name: '',
      description: '',
      display_order: 1,
      status: 'active'
    };

  }


  // =====================================================
  // UPDATE TOPIC
  // =====================================================

  // Update an existing topic
  updateTopic(): void {

    if (
      !this.editingTopicId ||
      !this.editTopic.name.trim() ||
      !this.editTopic.display_order
    ) {
      return;
    }

    this.adminProjectService
      .updateTopic(
        this.editingTopicId,
        this.editTopic
      )
      .subscribe({

        next: () => {

          this.cancelEditTopic();

          this.loadTopics();

        },

        error: (error) => {

          console.error(
            'Failed to update project topic:',
            error
          );

        }

      });

  }


  // =====================================================
  // DELETE TOPIC
  // =====================================================

  // Delete an existing topic
  deleteTopic(topicId: number): void {

    const confirmed = confirm(
      'Are you sure you want to delete this topic?'
    );

    if (!confirmed) {
      return;
    }

    this.adminProjectService
      .deleteTopic(topicId)
      .subscribe({

        next: () => {

          this.loadTopics();

        },

        error: (error) => {

          console.error(
            'Failed to delete project topic:',
            error
          );

        }

      });

  }

}