import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AdminTopicLearning } from '../../../../services/admin/admin-topic-learning';

@Component({
  selector: 'app-admin-topic-learning',
  standalone: true,
  imports: [],
  templateUrl: './admin-topic-learning.html',
  styleUrl: './admin-topic-learning.css'
})
export class AdminTopicLearningPage implements OnInit {

  // Topic ID from the URL
  topicId = signal<number | null>(null);

  // Topic name shown in the page header
  topicName = signal('');

  // Learning content fields
  simpleExplanation = signal('');
  realWorldExample = signal('');

  // Optional visual content
  visualText = signal('');
  selectedImage = signal<File | null>(null);
  existingImageUrl = signal('');

  codeExample = signal('');
  commonMistake = signal('');
  whereUsed = signal('');

  // Page states
  loading = signal(true);
  saving = signal(false);

  // Whether content already exists
  contentExists = signal(false);

  // Page/form messages
  message = signal('');
  errorMessage = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminTopicLearningService: AdminTopicLearning
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

    this.loadLearningContent(topicId);
  }


  // ==========================================
  // LOAD EXISTING LEARNING CONTENT
  // ==========================================

  loadLearningContent(topicId: number): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.adminTopicLearningService
      .getTopicLearningContent(topicId)
      .subscribe({

        next: (response: any) => {

          const content =
            response.content;

          this.topicName.set(
            content.topic_name || ''
          );

          this.simpleExplanation.set(
            content.simple_explanation || ''
          );

          this.realWorldExample.set(
            content.real_world_example || ''
          );

          this.visualText.set(
            content.visual_text || ''
          );

          this.existingImageUrl.set(
            content.visual_image_url || ''
          );

          this.codeExample.set(
            content.code_example || ''
          );

          this.commonMistake.set(
            content.common_mistake || ''
          );

          this.whereUsed.set(
            content.where_used || ''
          );

          this.contentExists.set(true);

          this.loading.set(false);
        },

        error: (error: any) => {

          // 404 means this topic has
          // no learning content yet.
          if (error.status === 404) {

            this.contentExists.set(false);

            this.loading.set(false);

            return;
          }

          console.error(
            'Failed to load learning content:',
            error
          );

          this.errorMessage.set(
            error.error?.message ||
            'Failed to load learning content'
          );

          this.loading.set(false);
        }

      });
  }


  // ==========================================
  // IMAGE SELECTION
  // ==========================================

  onImageSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (
      input.files &&
      input.files.length > 0
    ) {

      this.selectedImage.set(
        input.files[0]
      );

    } else {

      this.selectedImage.set(null);
    }
  }


  // ==========================================
  // SAVE LEARNING CONTENT
  // ==========================================

  saveLearningContent(): void {

    const topicId =
      this.topicId();

    if (!topicId) {
      return;
    }

    // Simple explanation is required
    if (!this.simpleExplanation().trim()) {

      this.message.set(
        'Simple explanation is required'
      );

      return;
    }

    this.saving.set(true);
    this.message.set('');
    this.errorMessage.set('');

    // ==========================================
    // CREATE FORM DATA
    // ==========================================

    const data = new FormData();

    data.append(
      'topicId',
      topicId.toString()
    );

    data.append(
      'simpleExplanation',
      this.simpleExplanation().trim()
    );

    data.append(
      'realWorldExample',
      this.realWorldExample().trim()
    );

    data.append(
      'visualText',
      this.visualText().trim()
    );

    data.append(
      'codeExample',
      this.codeExample().trim()
    );

    data.append(
      'commonMistake',
      this.commonMistake().trim()
    );

    data.append(
      'whereUsed',
      this.whereUsed().trim()
    );

    // Add image only when admin selected one
    if (this.selectedImage()) {

      data.append(
        'visualImage',
        this.selectedImage()!
      );
    }


    // ==========================================
    // UPDATE EXISTING CONTENT
    // ==========================================

    if (this.contentExists()) {

      this.adminTopicLearningService
        .updateTopicLearningContent(
          topicId,
          data
        )
        .subscribe({

          next: () => {

            this.saving.set(false);

            this.message.set(
              'Learning content updated successfully'
            );

          },

          error: (error: any) => {

            console.error(
              'Failed to update learning content:',
              error
            );

            this.errorMessage.set(
              error.error?.message ||
              'Failed to update learning content'
            );

            this.saving.set(false);
          }

        });

      return;
    }


    // ==========================================
    // CREATE NEW CONTENT
    // ==========================================

    this.adminTopicLearningService
      .createTopicLearningContent(data)
      .subscribe({

        next: () => {

          this.saving.set(false);

          this.contentExists.set(true);

          this.message.set(
            'Learning content created successfully'
          );

        },

        error: (error: any) => {

          console.error(
            'Failed to create learning content:',
            error
          );

          this.errorMessage.set(
            error.error?.message ||
            'Failed to create learning content'
          );

          this.saving.set(false);
        }

      });
  }


  // ==========================================
  // BACK TO TOPICS
  // ==========================================

  backToTopics(): void {

    this.router.navigate([
      '/admin/topics'
    ]);
  }

}