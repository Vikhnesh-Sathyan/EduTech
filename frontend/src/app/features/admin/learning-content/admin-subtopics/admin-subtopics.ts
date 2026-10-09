import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AdminSubtopic } from '../../../../services/admin/admin-subtopic';

@Component({
  selector: 'app-admin-subtopics',
  standalone: true,
  imports: [],
  templateUrl: './admin-subtopics.html',
  styleUrl: './admin-subtopics.css'
})
export class AdminSubtopicsPage implements OnInit {

  topicId = signal<number | null>(null);
  topicName = signal('');

  subtopics = signal<any[]>([]);

  loading = signal(true);
  saving = signal(false);

  showForm = signal(false);
  editingSubtopicId = signal<number | null>(null);

  subtopicTitle = signal('');
  subtopicDescription = signal('');

  message = signal('');
  errorMessage = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminSubtopicService: AdminSubtopic
  ) {}

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('topicId');

    if (!id) {
      this.errorMessage.set(
        'Topic ID is missing'
      );

      this.loading.set(false);
      return;
    }

    const topicId = Number(id);

    this.topicId.set(topicId);

    this.loadSubtopics(topicId);
  }


  // Load all subtopics belonging to the topic
  loadSubtopics(topicId: number): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.adminSubtopicService
      .getSubtopics(topicId)
      .subscribe({

        next: (response: any) => {

          this.subtopics.set(
            response.subtopics || []
          );

          this.loading.set(false);
        },

        error: (error: any) => {

          console.error(
            'Failed to load subtopics:',
            error
          );

          this.errorMessage.set(
            error.error?.message ||
            'Failed to load subtopics'
          );

          this.loading.set(false);
        }

      });
  }


  // Open empty form for creating a subtopic
  openAddSubtopic(): void {

    this.editingSubtopicId.set(null);

    this.subtopicTitle.set('');
    this.subtopicDescription.set('');

    this.message.set('');
    this.errorMessage.set('');

    this.showForm.set(true);
  }


  // Save new or edited subtopic
  saveSubtopic(): void {

    const topicId = this.topicId();

    if (!topicId) {
      return;
    }

    if (!this.subtopicTitle().trim()) {

      this.errorMessage.set(
        'Subtopic title is required'
      );

      return;
    }

    this.saving.set(true);
    this.message.set('');
    this.errorMessage.set('');


    const data = {

      topicId,

      title:
        this.subtopicTitle().trim(),

      description:
        this.subtopicDescription().trim()

    };


    const editingId =
      this.editingSubtopicId();


    // Update existing subtopic
    if (editingId) {

      this.adminSubtopicService
        .updateSubtopic(
          editingId,
          data
        )
        .subscribe({

          next: () => {

            this.message.set(
              'Subtopic updated successfully'
            );

            this.resetForm();

            this.loadSubtopics(topicId);
          },

          error: (error: any) => {

            console.error(
              'Failed to update subtopic:',
              error
            );

            this.errorMessage.set(
              error.error?.message ||
              'Failed to update subtopic'
            );

            this.saving.set(false);
          }

        });

      return;
    }


    // Create new subtopic
    this.adminSubtopicService
      .createSubtopic(data)
      .subscribe({

        next: () => {

          this.message.set(
            'Subtopic created successfully'
          );

          this.resetForm();

          this.loadSubtopics(topicId);
        },

        error: (error: any) => {

          console.error(
            'Failed to create subtopic:',
            error
          );

          this.errorMessage.set(
            error.error?.message ||
            'Failed to create subtopic'
          );

          this.saving.set(false);
        }

      });
  }


  // Open existing subtopic in edit mode
  editSubtopic(subtopic: any): void {

    this.editingSubtopicId.set(
      subtopic.id
    );

    this.subtopicTitle.set(
      subtopic.title
    );

    this.subtopicDescription.set(
      subtopic.description || ''
    );

    this.message.set('');
    this.errorMessage.set('');

    this.showForm.set(true);
  }


  // Enable or disable a subtopic
  updateSubtopicStatus(
    subtopic: any
  ): void {

    const newStatus =
      subtopic.status === 'active'
        ? 'inactive'
        : 'active';


    this.adminSubtopicService
      .updateSubtopicStatus(
        subtopic.id,
        newStatus
      )
      .subscribe({

        next: () => {

          const topicId =
            this.topicId();

          if (topicId) {
            this.loadSubtopics(topicId);
          }
        },

        error: (error: any) => {

          console.error(
            'Failed to update subtopic status:',
            error
          );

          this.errorMessage.set(
            error.error?.message ||
            'Failed to update subtopic status'
          );
        }

      });
  }


  // Open sections belonging to this subtopic
  openSections(
    subtopicId: number
  ): void {

    this.router.navigate([
      '/admin/subtopic-sections',
      subtopicId
    ]);
  }


  // Reset the subtopic form
  resetForm(): void {

    this.subtopicTitle.set('');
    this.subtopicDescription.set('');

    this.editingSubtopicId.set(null);

    this.showForm.set(false);

    this.saving.set(false);
  }

}