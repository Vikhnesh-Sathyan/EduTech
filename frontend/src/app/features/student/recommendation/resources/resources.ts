
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  Resource,
  ResourceService
} from '../../../../services/student/resource.service';

import { ResourceListComponent } from './components/resource-list/resource-list';
import { ResourceFiltersComponent } from './components/resource-filters/resource-filters';
import { ResourceFormComponent } from './components/resource-form/resource-form';
import { MyResourcesComponent } from './components/my-resources/my-resources';
import { ResourceDetailsComponent } from './components/resource-details/resource-details';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [
    CommonModule,
    ResourceListComponent,
    ResourceFiltersComponent,
    ResourceFormComponent,
    MyResourcesComponent,
    ResourceDetailsComponent
  ],
  templateUrl: './resources.html',
  styleUrl: './resources.css'
})
export class ResourcesComponent implements OnInit {

  // Resources returned by the API.
  resources = signal<Resource[]>([]);

  // Currently selected resource.
  selectedResource = signal<Resource | null>(null);

  // Loading and message states.
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  // Filters.
  selectedSubjectId = signal<number | undefined>(undefined);
  selectedResourceType = signal('');

  // Form and section visibility.
  showSubmitForm = signal(false);
  showMyResources = signal(false);
  submitting = signal(false);

  constructor(
    private readonly resourceService: ResourceService
  ) {}

  ngOnInit(): void {
    this.loadResources();
  }

  // Load approved resources using the selected filters.
  loadResources(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.resourceService
      .getApprovedResources(
        this.selectedSubjectId(),
        this.selectedResourceType() || undefined
      )
      .subscribe({
        next: (response) => {
          const resources: Resource[] = Array.isArray(response)
            ? response
            : response?.resources ?? response?.data ?? [];

          this.resources.set(resources);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Failed to load resources:', error);

          this.errorMessage.set(
            'Unable to load learning resources. Please try again.'
          );

          this.loading.set(false);
        }
      });
  }

  // Update the subject filter and reload resources.
  onSubjectChange(subjectId: number | undefined): void {
    this.selectedSubjectId.set(subjectId);
    this.loadResources();
  }

  // Update the resource type filter and reload resources.
  onResourceTypeChange(resourceType: string): void {
    this.selectedResourceType.set(resourceType);
    this.loadResources();
  }

  // Submit a resource and show the student's submission status.
  submitResource(formData: FormData): void {
    this.submitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.resourceService.submitResource(formData).subscribe({
      next: (response) => {
        this.submitting.set(false);
        this.showSubmitForm.set(false);

        this.successMessage.set(
          response.message ||
          'Resource submitted successfully. It will be visible after admin approval.'
        );

        this.showMyResources.set(true);
      },
      error: (error) => {
        console.error('Failed to submit resource:', error);

        this.errorMessage.set(
          error.error?.message ||
          'Unable to submit the resource. Please try again.'
        );

        this.submitting.set(false);
      }
    });
  }

  // Close the submission form.
  cancelResourceForm(): void {
    this.showSubmitForm.set(false);
    this.errorMessage.set('');
  }

  // Toggle the resource submission form.
  toggleSubmitForm(): void {
    this.showSubmitForm.update((visible) => !visible);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  // Toggle the student's personal resource submissions.
  toggleMyResources(): void {
    this.showMyResources.update((visible) => !visible);
    this.successMessage.set('');
  }

  // Open the dedicated resource details view.
  openResource(resource: Resource): void {
    this.selectedResource.set(resource);
  }
}
