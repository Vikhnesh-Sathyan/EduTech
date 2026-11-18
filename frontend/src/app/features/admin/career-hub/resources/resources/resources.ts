
import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal
} from '@angular/core';

import { CommonModule, DatePipe } from '@angular/common';

import {
  AdminCareerResources,
  CareerResource
} from '../../../../../services/admin/career-hub/admin-career-resources';

import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './resources.html',
  styleUrl: './resources.css'
})
export class Resources implements OnInit, OnDestroy {

  private resourceService = inject(AdminCareerResources);
  private sanitizer = inject(DomSanitizer);

  // ==========================================
  // RESOURCE DATA
  // ==========================================

  resources = signal<CareerResource[]>([]);

  loading = signal(false);

  errorMessage = signal('');
  successMessage = signal('');

  // ==========================================
  // PDF PREVIEW
  // ==========================================

  previewUrl = signal<SafeResourceUrl | null>(null);

  previewTitle = signal('');

  private rawPreviewUrl: string | null = null;

  // ==========================================
  // INITIALIZATION
  // ==========================================

  ngOnInit(): void {
    this.loadResources();
  }

  // ==========================================
  // LOAD ALL RESOURCES
  // ==========================================

  loadResources(): void {

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.resourceService.getResources().subscribe({

      next: (response) => {

        this.resources.set(response.resources || []);

        this.loading.set(false);
      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message || 'Failed to load career resources'
        );

        this.loading.set(false);
      }

    });
  }

  // ==========================================
  // PREVIEW PDF
  // ==========================================

  previewResource(resource: CareerResource): void {

    this.errorMessage.set('');

    this.resourceService.previewResource(resource.id).subscribe({

      next: (blob) => {

        this.closePreview();

        this.rawPreviewUrl = URL.createObjectURL(blob);

        this.previewUrl.set(
          this.sanitizer.bypassSecurityTrustResourceUrl(
            this.rawPreviewUrl
          )
        );

        this.previewTitle.set(resource.title);
      },

      error: () => {

        this.errorMessage.set(
          'Unable to preview this PDF'
        );
      }

    });
  }

  // ==========================================
  // CLOSE PDF PREVIEW
  // ==========================================

  closePreview(): void {

    if (this.rawPreviewUrl) {

      URL.revokeObjectURL(this.rawPreviewUrl);

      this.rawPreviewUrl = null;
    }

    this.previewUrl.set(null);

    this.previewTitle.set('');
  }

  // ==========================================
  // ARCHIVE RESOURCE
  // ==========================================

  archiveResource(id: number): void {

    const confirmed = confirm(
      'Are you sure you want to archive this resource?'
    );

    if (!confirmed) return;

    this.errorMessage.set('');
    this.successMessage.set('');

    this.resourceService.archiveResource(id).subscribe({

      next: (response) => {

        this.successMessage.set(
          response.message || 'Resource archived successfully'
        );

        this.resources.update(items =>
          items.map(resource =>
            resource.id === id
              ? { ...resource, status: 'archived' }
              : resource
          )
        );

      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message || 'Failed to archive resource'
        );

      }

    });
  }

  // ==========================================
  // COMPONENT CLEANUP
  // ==========================================

  ngOnDestroy(): void {

    this.closePreview();
  }

}
