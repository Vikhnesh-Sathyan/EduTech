import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AdminTopic } from '../../../../services/admin/admin-topic';
import { AdminDiagnostic } from '../../../../services/admin/admin-diagnostic';

@Component({
  selector: 'app-topics',
  standalone: true,
  imports: [],
  templateUrl: './topics.html',
  styleUrl: './topics.css'
})
export class Topics implements OnInit {

  // Active subjects
  subjects = signal<any[]>([]);

  // Topics for selected subject
  topics = signal<any[]>([]);

  // Selected subject
  selectedSubjectId = signal<number | null>(null);

  // Loading states
  loadingSubjects = signal(true);
  loadingTopics = signal(false);

  // Show Add Topic form
  showForm = signal(false);

  // Form fields
  topicName = signal('');
  topicDescription = signal('');
  topicDisplayOrder = signal(1);

  // Currently edited topic
  editingTopicId = signal<number | null>(null);

  // Form saving state
  saving = signal(false);

  // Form message
  formMessage = signal('');

  // Error message
  errorMessage = signal('');

  constructor(
    private router: Router,
    private adminTopicService: AdminTopic,
    private adminDiagnosticService: AdminDiagnostic
  ) {}

  ngOnInit(): void {
    this.loadSubjects();
  }

  // ==========================================
  // LOAD SUBJECTS
  // ==========================================

  loadSubjects(): void {

    this.loadingSubjects.set(true);

    this.adminDiagnosticService
      .getSubjects()
      .subscribe({

        next: (response: any) => {

          this.subjects.set(
            response.subjects || []
          );

          this.loadingSubjects.set(false);
        },

        error: (error: any) => {

          console.error(
            'Failed to load subjects:',
            error
          );

          this.errorMessage.set(
            'Failed to load subjects'
          );

          this.loadingSubjects.set(false);
        }

      });
  }

  // ==========================================
  // LOAD TOPICS
  // ==========================================

  loadTopics(subjectId: string): void {

    if (!subjectId) {

      this.selectedSubjectId.set(null);
      this.topics.set([]);

      return;
    }

    const id = Number(subjectId);

    this.selectedSubjectId.set(id);
    this.loadingTopics.set(true);

    this.adminTopicService
      .getTopicsBySubject(id)
      .subscribe({

        next: (response: any) => {

          this.topics.set(
            response.topics || []
          );

          this.loadingTopics.set(false);
        },

        error: (error: any) => {

          console.error(
            'Failed to load topics:',
            error
          );

          this.topics.set([]);
          this.loadingTopics.set(false);
        }

      });
  }

  // ==========================================
  // OPEN ADD TOPIC FORM
  // ==========================================

  openAddTopic(): void {

    this.editingTopicId.set(null);

    this.showForm.set(true);

    this.topicName.set('');
    this.topicDescription.set('');
    this.topicDisplayOrder.set(1);

    this.formMessage.set('');
  }

  // ==========================================
  // OPEN EDIT TOPIC FORM
  // ==========================================

  openEditTopic(topic: any): void {

    this.editingTopicId.set(topic.id);

    this.topicName.set(topic.name);

    this.topicDescription.set(
      topic.description || ''
    );

    this.topicDisplayOrder.set(
      topic.display_order
    );

    this.formMessage.set('');
    this.showForm.set(true);
  }

  // ==========================================
  // CREATE / UPDATE TOPIC
  // ==========================================

  createTopic(): void {

    const subjectId =
      this.selectedSubjectId();

    if (!subjectId) {

      this.formMessage.set(
        'Please select a subject first'
      );

      return;
    }

    const name =
      this.topicName().trim();

    if (!name) {

      this.formMessage.set(
        'Topic name is required'
      );

      return;
    }

    this.saving.set(true);
    this.formMessage.set('');

    const data = {

      subjectId,

      name,

      description:
        this.topicDescription().trim() || null,

      displayOrder:
        this.topicDisplayOrder()

    };

    const editingId =
      this.editingTopicId();

    // ==========================================
    // UPDATE EXISTING TOPIC
    // ==========================================

    if (editingId) {

      this.adminTopicService
        .updateTopic(editingId, data)
        .subscribe({

          next: () => {

            this.saving.set(false);

            this.showForm.set(false);

            this.editingTopicId.set(null);

            this.loadTopics(
              String(subjectId)
            );
          },

          error: (error: any) => {

            console.error(
              'Failed to update topic:',
              error
            );

            this.formMessage.set(
              error.error?.message ||
              'Failed to update topic'
            );

            this.saving.set(false);
          }

        });

      return;
    }

    // ==========================================
    // CREATE NEW TOPIC
    // ==========================================

    this.adminTopicService
      .createTopic(data)
      .subscribe({

        next: () => {

          this.saving.set(false);

          this.showForm.set(false);

          this.loadTopics(
            String(subjectId)
          );
        },

        error: (error: any) => {

          console.error(
            'Failed to create topic:',
            error
          );

          this.formMessage.set(
            error.error?.message ||
            'Failed to create topic'
          );

          this.saving.set(false);
        }

      });
  }

  // ==========================================
  // UPDATE TOPIC STATUS
  // ==========================================

  updateTopicStatus(topic: any): void {

    const newStatus =
      topic.status === 'active'
        ? 'inactive'
        : 'active';

    this.adminTopicService
      .updateTopicStatus(
        topic.id,
        newStatus
      )
      .subscribe({

        next: () => {

          const subjectId =
            this.selectedSubjectId();

          if (subjectId) {

            this.loadTopics(
              String(subjectId)
            );
          }
        },

        error: (error: any) => {

          console.error(
            'Failed to update topic status:',
            error
          );

          this.formMessage.set(
            error.error?.message ||
            'Failed to update topic status'
          );
        }

      });
  }

  // ==========================================
  // OPEN LEARNING CONTENT
  // ==========================================

  openLearningContent(
    topicId: number
  ): void {

    this.router.navigate([
      '/admin/topic-learning',
      topicId
    ]);

    
  }
  openSubtopics(topicId: number): void {
  this.router.navigate([
    '/admin/subtopics',
    topicId
  ]);
}

}