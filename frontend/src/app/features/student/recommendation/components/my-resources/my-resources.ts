import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  Resource,
  ResourceService
} from '../../../../../services/student/resource.service';

@Component({
  selector: 'app-my-resources',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-resources.html',
  styleUrl: './my-resources.css'
})
export class MyResourcesComponent implements OnInit {

  // Signals store component state and notify Angular when values change.
  resources = signal<Resource[]>([]);
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  deletingResourceId = signal<number | null>(null);

  constructor(
    private readonly resourceService: ResourceService
  ) {}

  ngOnInit(): void {
    this.loadMyResources();
  }

  // Load the current student's submitted resources.
  loadMyResources(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.resourceService.getMyResources().subscribe({
      next: (response) => {
        // The API returns an object containing a resources array.
        const resources: Resource[] = Array.isArray(response)
          ? response
          : response?.resources ?? response?.data ?? [];

        this.resources.set(resources);
        this.loading.set(false);

        console.log('Resources loaded:', this.resources().length);
      },

      error: (error) => {
        console.error('Failed to load my resources:', error);

        this.errorMessage.set(
          error.error?.message ||
          'Unable to load your submissions. Please try again.'
        );

        this.loading.set(false);
      }
    });
  }

  // Delete a resource submitted by the current student.
  deleteResource(resource: Resource): void {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${resource.title}"?`
    );

    if (!confirmed) {
      return;
    }

    this.deletingResourceId.set(resource.id);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.resourceService.deleteResource(resource.id).subscribe({
      next: () => {
        // Remove the deleted resource from the signal.
        this.resources.update((items) =>
          items.filter((item) => item.id !== resource.id)
        );

        this.successMessage.set('Resource deleted successfully.');
        this.deletingResourceId.set(null);
      },

      error: (error) => {
        console.error('Failed to delete resource:', error);

        this.errorMessage.set(
          error.error?.message || 'Unable to delete this resource.'
        );

        this.deletingResourceId.set(null);
      }
    });
  }

  // Convert the resource status into a readable label.
  getStatusLabel(status: Resource['status']): string {
    const labels: Record<Resource['status'], string> = {
      pending: 'Pending Review',
      approved: 'Approved',
      rejected: 'Rejected'
    };

    return labels[status] ?? status;
  }
}
