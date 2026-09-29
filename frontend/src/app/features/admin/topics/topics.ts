import { Component, OnInit, signal } from '@angular/core';
import { AdminTopic } from '../../../services/admin-topic';
import { AdminDiagnostic } from '../../../services/admin-diagnostic';

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

  editingTopicId = signal<number | null>(null);


  // Form saving state
  saving = signal(false);

  // Form message
  formMessage = signal('');

  // Error message
  errorMessage = signal('');

  constructor(
    private adminTopicService: AdminTopic,
    private adminDiagnosticService: AdminDiagnostic
  ) {}

  ngOnInit(): void {
    this.loadSubjects();
  }

  // Load active subjects
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

  // Load topics when subject changes
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

      // Open Add Topic form
openAddTopic(): void {
  this.editingTopicId.set(null);

  this.showForm.set(true);

  this.topicName.set('');
  this.topicDescription.set('');
  this.topicDisplayOrder.set(1);

  this.formMessage.set('');
}

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


// Create a new topic
createTopic(): void {
  const subjectId = this.selectedSubjectId();

  if (!subjectId) {
    this.formMessage.set(
      'Please select a subject first'
    );
    return;
  }

  const name = this.topicName().trim();

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

  const editingId = this.editingTopicId();

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

}