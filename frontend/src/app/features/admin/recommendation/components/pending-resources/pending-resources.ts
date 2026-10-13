import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Resource, ResourceService } from '../../../../../services/student/resource.service';

@Component({
  selector: 'app-pending-resources',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-resources.html',
  styleUrl: './pending-resources.css'
})
export class PendingResourcesComponent implements OnInit {

  resources = signal<Resource[]>([]);
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  processingResourceId = signal<number | null>(null);

  constructor(
    private readonly resourceService: ResourceService
  ) {}

  ngOnInit(): void {
    this.loadPendingResources();
  }

  // Load submissions waiting for admin review
  loadPendingResources(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.resourceService.getPendingResources().subscribe({
      next: (response) => {
        this.resources.set(response.resources ?? []);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.message || 'Failed to load pending resources.'
        );
        this.loading.set(false);
      }
    });
  }

  // Approve a pending submission
  approveResource(resource: Resource): void {
    this.processingResourceId.set(resource.id);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.resourceService.approveResource(resource.id).subscribe({
      next: (response) => {
        this.resources.update(items =>
          items.filter(item => item.id !== resource.id)
        );

        this.successMessage.set(
          response.message || 'Resource approved successfully.'
        );

        this.processingResourceId.set(null);
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.message || 'Failed to approve resource.'
        );

        this.processingResourceId.set(null);
      }
    });
  }

  // Reject a pending submission with a reason
  rejectResource(resource: Resource): void {
    const reason = window.prompt(
      `Enter a rejection reason for "${resource.title}":`
    );

    if (reason === null) {
      return;
    }

    if (!reason.trim()) {
      this.errorMessage.set('Please enter a rejection reason.');
      return;
    }

    this.processingResourceId.set(resource.id);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.resourceService
      .rejectResource(resource.id, reason.trim())
      .subscribe({
        next: (response) => {
          this.resources.update(items =>
            items.filter(item => item.id !== resource.id)
          );

          this.successMessage.set(
            response.message || 'Resource rejected successfully.'
          );

          this.processingResourceId.set(null);
        },
        error: (error) => {
          this.errorMessage.set(
            error.error?.message || 'Failed to reject resource.'
          );

          this.processingResourceId.set(null);
        }
      });
  }
}
