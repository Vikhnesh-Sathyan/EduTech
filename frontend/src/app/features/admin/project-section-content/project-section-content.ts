import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AdminProjectService } from '../../../services/admin-project.service';

@Component({
  selector: 'app-project-section-content',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './project-section-content.html',
  styleUrl: './project-section-content.css'
})
export class ProjectSectionContent implements OnInit {

  

  backendUrl = 'http://localhost:5000';

  // =====================================================
  // SECTION
  // =====================================================

  sectionId!: number;


  // =====================================================
  // CONTENT
  // =====================================================

  // Store loaded section content
  content = signal<any | null>(null);


  // =====================================================
  // FORM
  // =====================================================

  sectionContent = {
    what: '',
    why: '',
    flow: '',
    important_keywords: '',
    important_code: '',
    photo_url: '',
    photo_caption: ''
  };


  // =====================================================
  // STATE
  // =====================================================

  // Track whether content already exists
  contentExists = signal(false);

  // Track loading state
  loading = signal(false);

  // Track saving state
  saving = signal(false);


  constructor(
    private route: ActivatedRoute,
    private adminProjectService: AdminProjectService
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.sectionId = Number(
      this.route.snapshot.paramMap.get('sectionId')
    );

    this.loadContent();

  }


  // =====================================================
  // LOAD CONTENT
  // =====================================================

  // Load content belonging to the selected section
  loadContent(): void {

    this.loading.set(true);

    this.adminProjectService
      .getSectionContent(this.sectionId)
      .subscribe({

        next: (response: any) => {

          this.content.set(response);

          this.sectionContent = {
            what: response.what || '',
            why: response.why || '',
            flow: response.flow || '',
            important_keywords:
              response.important_keywords || '',
            important_code:
              response.important_code || '',
            photo_url:
              response.photo_url || '',
            photo_caption:
              response.photo_caption || ''
          };

          this.contentExists.set(true);

          this.loading.set(false);

        },

        error: (error) => {

          this.loading.set(false);

          if (error.status === 404) {

            this.content.set(null);

            this.contentExists.set(false);

            return;
          }

          console.error(
            'Failed to load project section content:',
            error
          );

        }

      });

  }


  // =====================================================
  // SAVE CONTENT
  // =====================================================

  // Create or update section content
  saveContent(): void {

    if (!this.sectionContent.what.trim()) {
      return;
    }

    this.saving.set(true);


    // Update existing content
    if (this.contentExists()) {

      this.adminProjectService
        .updateSectionContent(
          this.sectionId,
          this.sectionContent
        )
        .subscribe({

          next: () => {

            this.saving.set(false);

            this.loadContent();

          },

          error: (error) => {

            this.saving.set(false);

            console.error(
              'Failed to update project section content:',
              error
            );

          }

        });

      return;
    }


    // Create new content
    this.adminProjectService
      .createSectionContent(
        this.sectionId,
        this.sectionContent
      )
      .subscribe({

        next: () => {

          this.saving.set(false);

          this.loadContent();

        },

        error: (error) => {

          this.saving.set(false);

          console.error(
            'Failed to create project section content:',
            error
          );

        }

      });
  }

  onImageSelected(event: Event): void {
  const input = event.target as HTMLInputElement;

  if (!input.files || input.files.length === 0) {
    return;
  }

  const file = input.files[0];

  const formData = new FormData();

  formData.append('photo', file);

  this.saving.set(true);

  this.adminProjectService
    .uploadSectionImage(this.sectionId, formData)
    .subscribe({
      next: (response: any) => {

        this.sectionContent.photo_url =
          response.photo_url;

        this.saving.set(false);
      },

      error: (error) => {

        this.saving.set(false);

        console.error(
          'Failed to upload project section image:',
          error
        );
      }
    });
}

}