import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';

import { AdminLearningSection } from '../../../services/admin-learning-section';

@Component({
  selector: 'app-admin-learning-sections',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './admin-learning-sections.html',
  styleUrl: './admin-learning-sections.css'
})
export class AdminLearningSectionsPage implements OnInit {

  subtopicId = signal<number | null>(null);

  subtopicTitle = signal('');

  sections = signal<any[]>([]);

  loading = signal(true);
  saving = signal(false);

  sectionTitle = signal('');
  sectionDescription = signal('');

  editingSectionId =
    signal<number | null>(null);

  message = signal('');
  errorMessage = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminLearningSectionService:
      AdminLearningSection
  ) {}


  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get(
        'subtopicId'
      );

    if (!id) {

      this.errorMessage.set(
        'Subtopic ID is missing'
      );

      this.loading.set(false);

      return;
    }

    const subtopicId =
      Number(id);

    this.subtopicId.set(
      subtopicId
    );

    this.loadSections(
      subtopicId
    );
  }


  // Load all sections belonging to the subtopic
  loadSections(
    subtopicId: number
  ): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.adminLearningSectionService
      .getLearningSections(
        subtopicId
      )
      .subscribe({

        next: (response: any) => {

          this.sections.set(
            response.sections || []
          );

          this.loading.set(false);
        },

        error: (error: any) => {

          console.error(
            'Failed to load learning sections:',
            error
          );

          this.errorMessage.set(
            error.error?.message ||
            'Failed to load learning sections'
          );

          this.loading.set(false);
        }

      });
  }


  // Save a new section or update an existing section
  saveSection(): void {

    const subtopicId =
      this.subtopicId();

    if (!subtopicId) {
      return;
    }


    if (!this.sectionTitle().trim()) {

      this.errorMessage.set(
        'Section title is required'
      );

      return;
    }


    this.saving.set(true);
    this.message.set('');
    this.errorMessage.set('');


    const data = {

      subtopicId,

      title:
        this.sectionTitle().trim(),

      description:
        this.sectionDescription().trim()

    };


    const editingId =
      this.editingSectionId();


    // Update existing section
    if (editingId) {

      this.adminLearningSectionService
        .updateLearningSection(
          editingId,
          data
        )
        .subscribe({

          next: () => {

            this.message.set(
              'Learning section updated successfully'
            );

            this.resetForm();

            this.loadSections(
              subtopicId
            );
          },

          error: (error: any) => {

            console.error(
              'Failed to update learning section:',
              error
            );

            this.errorMessage.set(
              error.error?.message ||
              'Failed to update learning section'
            );

            this.saving.set(false);
          }

        });

      return;
    }


    // Create new section
    this.adminLearningSectionService
      .createLearningSection(
        data
      )
      .subscribe({

        next: () => {

          this.message.set(
            'Learning section created successfully'
          );

          this.resetForm();

          this.loadSections(
            subtopicId
          );
        },

        error: (error: any) => {

          console.error(
            'Failed to create learning section:',
            error
          );

          this.errorMessage.set(
            error.error?.message ||
            'Failed to create learning section'
          );

          this.saving.set(false);
        }

      });
  }


  // Open a section for editing
  editSection(
    section: any
  ): void {

    this.editingSectionId.set(
      section.id
    );

    this.sectionTitle.set(
      section.title
    );

    this.sectionDescription.set(
      section.description || ''
    );

    this.message.set('');
    this.errorMessage.set('');
  }


  // Open the learning content for this section
  openSectionContent(
    sectionId: number
  ): void {

    this.router.navigate([
      '/admin/section-learning',
      sectionId
    ]);
  }


  // Enable or disable a section
  updateSectionStatus(
    section: any
  ): void {

    const newStatus =
      section.status === 'active'
        ? 'inactive'
        : 'active';


    this.adminLearningSectionService
      .updateLearningSectionStatus(
        section.id,
        newStatus
      )
      .subscribe({

        next: () => {

          const subtopicId =
            this.subtopicId();

          if (subtopicId) {

            this.loadSections(
              subtopicId
            );
          }
        },

        error: (error: any) => {

          console.error(
            'Failed to update section status:',
            error
          );

          this.errorMessage.set(
            error.error?.message ||
            'Failed to update section status'
          );
        }

      });
  }


  // Reset the section form
  resetForm(): void {

    this.sectionTitle.set('');
    this.sectionDescription.set('');

    this.editingSectionId.set(
      null
    );

    this.saving.set(false);
  }

}