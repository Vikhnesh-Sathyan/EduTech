import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AdminSectionLearning } from '../../../services/admin-section-learning';


@Component({
  selector: 'app-admin-section-learning',
  standalone: true,
  imports: [],
  templateUrl: './admin-section-learning.html',
  styleUrl: './admin-section-learning.css'
})
export class AdminSectionLearningPage implements OnInit {

  // =====================================================
  // SECTION INFORMATION
  // =====================================================

  // Section ID from the URL
  sectionId = signal<number | null>(null);

  // Section and topic information
  sectionTitle = signal('');
  topicName = signal('');


  // =====================================================
  // PAGE STATES
  // =====================================================

  loading = signal(true);
  saving = signal(false);


  // =====================================================
  // CONTENT EXISTENCE
  // =====================================================

  contentExists = signal(false);


  // =====================================================
  // FORM FIELDS
  // =====================================================

  simpleExplanation = signal('');
  realWorldExample = signal('');
  visualText = signal('');
  codeExample = signal('');
  commonMistake = signal('');
  whereUsed = signal('');


  // =====================================================
  // VISUAL IMAGE
  // =====================================================

  // Image URL stored in database
  visualImageUrl = signal('');

  // Image URL used for preview
  imagePreviewUrl = signal('');

  // Newly selected image file
  selectedImage: File | null = null;


  // =====================================================
  // MESSAGES
  // =====================================================

  message = signal('');
  errorMessage = signal('');


  constructor(
    private route: ActivatedRoute,
    private adminSectionLearningService: AdminSectionLearning
  ) {}


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('sectionId');

    if (!id) {

      this.errorMessage.set(
        'Section ID is missing'
      );

      this.loading.set(false);

      return;
    }

    const sectionId = Number(id);

    this.sectionId.set(sectionId);

    this.loadContent(sectionId);
  }


  // =====================================================
  // LOAD CONTENT
  // =====================================================

  loadContent(sectionId: number): void {

    this.loading.set(true);
    this.errorMessage.set('');
    this.message.set('');

    this.adminSectionLearningService
      .getSectionLearningContent(sectionId)
      .subscribe({

        next: (response: any) => {

          const content = response.content;
          const section = response.section;


          // =================================================
          // SECTION INFORMATION
          // =================================================

          // Section information exists even when
          // learning content has not been created yet.
          this.sectionTitle.set(
            content?.section_title ||
            section?.title ||
            ''
          );

          this.topicName.set(
            content?.topic_name ||
            section?.topic_name ||
            ''
          );


          // =================================================
          // EXISTING CONTENT
          // =================================================

          if (content) {

            this.contentExists.set(true);

            this.simpleExplanation.set(
              content.simple_explanation || ''
            );

            this.realWorldExample.set(
              content.real_world_example || ''
            );

            this.visualText.set(
              content.visual_text || ''
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


            // ===============================================
            // EXISTING IMAGE
            // ===============================================

            this.visualImageUrl.set(
              content.visual_image_url || ''
            );

            if (content.visual_image_url) {

              this.imagePreviewUrl.set(
                `http://localhost:5000${content.visual_image_url}`
              );

            } else {

              this.imagePreviewUrl.set('');

            }

          } else {

            // No learning content exists yet
            this.contentExists.set(false);

            this.visualImageUrl.set('');
            this.imagePreviewUrl.set('');

          }


          this.loading.set(false);
        },


        error: (error: any) => {

          console.error(
            'Failed to load section learning content:',
            error
          );


          // This is kept for compatibility with
          // APIs that may return 404.
          if (error.status === 404) {

            this.contentExists.set(false);

            this.loading.set(false);

            return;
          }


          this.errorMessage.set(
            error.error?.message ||
            'Failed to load learning content'
          );

          this.loading.set(false);

        }

      });
  }


  // =====================================================
  // IMAGE SELECTION
  // =====================================================

  onImageSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;


    // No file selected
    if (!input.files || input.files.length === 0) {

      return;
    }


    const file = input.files[0];


    // Only allow image files
    if (!file.type.startsWith('image/')) {

      this.errorMessage.set(
        'Please select a valid image file'
      );

      input.value = '';

      return;
    }


    // Store selected file
    this.selectedImage = file;


    // Create temporary preview
    this.imagePreviewUrl.set(
      URL.createObjectURL(file)
    );


    // Clear previous error
    this.errorMessage.set('');
  }


  // =====================================================
  // SAVE CONTENT
  // =====================================================

  saveContent(): void {

    const sectionId =
      this.sectionId();


    // Section ID is required
    if (!sectionId) {

      return;
    }


    // Simple explanation is required
    if (!this.simpleExplanation().trim()) {

      this.errorMessage.set(
        'Simple explanation is required'
      );

      return;
    }


    this.saving.set(true);
    this.message.set('');
    this.errorMessage.set('');


    // =====================================================
    // FORM DATA
    // =====================================================

    // FormData is required because the request
    // can contain both text and an image file.
    const formData = new FormData();


    formData.append(
      'sectionId',
      sectionId.toString()
    );


    formData.append(
      'simpleExplanation',
      this.simpleExplanation().trim()
    );


    formData.append(
      'realWorldExample',
      this.realWorldExample().trim()
    );


    formData.append(
      'visualText',
      this.visualText().trim()
    );


    formData.append(
      'codeExample',
      this.codeExample().trim()
    );


    formData.append(
      'commonMistake',
      this.commonMistake().trim()
    );


    formData.append(
      'whereUsed',
      this.whereUsed().trim()
    );


    // =====================================================
    // IMAGE
    // =====================================================

    // Only send an image when the admin selected
    // a new image.
    if (this.selectedImage) {

      formData.append(
        'visualImage',
        this.selectedImage
      );

    }


    // =====================================================
    // UPDATE EXISTING CONTENT
    // =====================================================

    if (this.contentExists()) {

      this.adminSectionLearningService
        .updateSectionLearningContent(
          sectionId,
          formData
        )
        .subscribe({

          next: () => {

            this.message.set(
              'Learning content updated successfully'
            );

            this.saving.set(false);

            // Reload content so the newly uploaded
            // image and data are displayed.
            this.loadContent(sectionId);

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


    // =====================================================
    // CREATE NEW CONTENT
    // =====================================================

    this.adminSectionLearningService
      .createSectionLearningContent(formData)
      .subscribe({

        next: () => {

          this.contentExists.set(true);

          this.message.set(
            'Learning content created successfully'
          );

          this.saving.set(false);

          // Reload content so the created image
          // and content are loaded from the database.
          this.loadContent(sectionId);

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

}