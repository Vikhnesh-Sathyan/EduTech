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

import { AdminProjectService } from '../../../services/admin-project.service';


@Component({
  selector: 'app-project-sections',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './project-sections.html',
  styleUrl: './project-sections.css'
})
export class ProjectSections implements OnInit {

  // =====================================================
  // CATEGORY
  // =====================================================

  categoryId!: number;


  // =====================================================
  // TOPIC
  // =====================================================

  topicId!: number;


  // =====================================================
  // SECTIONS
  // =====================================================

  // Store sections received from the backend
  sections = signal<any[]>([]);


  // =====================================================
  // ADD SECTION
  // =====================================================

  showAddForm = false;

  newSection = {
    title: '',
    description: '',
    display_order: 1
  };


  // =====================================================
  // EDIT SECTION
  // =====================================================

  editingSectionId: number | null = null;

  editSection = {
    title: '',
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

    this.topicId = Number(
      this.route.snapshot.paramMap.get('topicId')
    );

    this.loadSections();

  }


  // =====================================================
  // LOAD SECTIONS
  // =====================================================

  // Load sections belonging to the selected topic
  loadSections(): void {

    this.adminProjectService
      .getSections(this.topicId)
      .subscribe({

        next: (response: any) => {

          const sections = Array.isArray(response)
            ? response
            : response.sections || [];

          this.sections.set(sections);

        },

        error: (error) => {

          console.error(
            'Failed to load project sections:',
            error
          );

        }

      });

  }


  // =====================================================
  // CREATE SECTION
  // =====================================================

  // Create a new section
  createSection(): void {

    if (
      !this.newSection.title.trim() ||
      !this.newSection.display_order
    ) {
      return;
    }

    this.adminProjectService
      .createSection(
        this.topicId,
        this.newSection
      )
      .subscribe({

        next: () => {

          this.showAddForm = false;

          this.newSection = {
            title: '',
            description: '',
            display_order: 1
          };

          this.loadSections();

        },

        error: (error) => {

          console.error(
            'Failed to create project section:',
            error
          );

        }

      });

  }


  // =====================================================
  // START EDIT
  // =====================================================

  // Load section data into the edit form
  startEditSection(section: any): void {

    this.editingSectionId = section.id;

    this.editSection = {
      title: section.title,
      description: section.description || '',
      display_order: section.display_order,
      status: section.status || 'active'
    };

  }


  // =====================================================
  // CANCEL EDIT
  // =====================================================

  // Close the edit form
  cancelEditSection(): void {

    this.editingSectionId = null;

    this.editSection = {
      title: '',
      description: '',
      display_order: 1,
      status: 'active'
    };

  }


  // =====================================================
  // UPDATE SECTION
  // =====================================================

  // Update an existing section
  updateSection(): void {

    if (
      !this.editingSectionId ||
      !this.editSection.title.trim() ||
      !this.editSection.display_order
    ) {
      return;
    }

    this.adminProjectService
      .updateSection(
        this.editingSectionId,
        this.editSection
      )
      .subscribe({

        next: () => {

          this.cancelEditSection();

          this.loadSections();

        },

        error: (error) => {

          console.error(
            'Failed to update project section:',
            error
          );

        }

      });

  }


  // =====================================================
  // DELETE SECTION
  // =====================================================

  // Delete an existing section
  deleteSection(sectionId: number): void {

    const confirmed = confirm(
      'Are you sure you want to delete this section?'
    );

    if (!confirmed) {
      return;
    }

    this.adminProjectService
      .deleteSection(sectionId)
      .subscribe({

        next: () => {

          this.loadSections();

        },

        error: (error) => {

          console.error(
            'Failed to delete project section:',
            error
          );

        }

      });

  }

}