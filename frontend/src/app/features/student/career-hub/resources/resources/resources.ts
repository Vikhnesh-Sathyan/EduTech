import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal
} from '@angular/core';

import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';

import { CommonModule } from '@angular/common';
import { PdfEditor } from '../pdf-editor/pdf-editor';
import {
  StudentCareerResourcesService,
  ResourceCountry
} from '../../../../../services/student/career-hub/student-career-resources.service';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, PdfEditor],
  templateUrl: './resources.html',
  styleUrl: './resources.css'
})
export class Resources implements OnInit, OnDestroy {

  private resourceService = inject(StudentCareerResourcesService);

  // ==========================================
  // RESOURCE DATA
  // ==========================================

  resources = signal<any[]>([]);
  myResources = signal<any[]>([]);
  countries = signal<ResourceCountry[]>([]);

  selectedResourceId = signal<number | null>(null);

  // PDF VIEWER

  private sanitizer = inject(DomSanitizer);

  previewUrl = signal<SafeResourceUrl | null>(null);

  previewObjectUrl: string | null = null;

  isLoadingPreview = signal(false);

  previewError = signal('');

  // Upload Form
  showUploadForm = signal(false);

  uploadTitle = signal('');
  uploadResourceType = signal('resume');
  uploadExperienceLevel = signal('fresher');
  uploadCountryId = signal('');
  uploadDescription = signal('');

  selectedFile = signal<File | null>(null);

  isUploading = signal(false);

  // ==========================================
  // LOADING STATES
  // ==========================================

  isLoading = signal(false);
  isLoadingMyResources = signal(false);

  // ==========================================
  // FILTERS
  // ==========================================

  selectedResourceType = signal('');
  selectedExperienceLevel = signal('');
  selectedCountryId = signal('');

  // ==========================================
  // ERROR AND SUCCESS
  // ==========================================

  errorMessage = signal('');
  successMessage = signal('');

  // ==========================================
  // INITIALIZE
  // ==========================================

  ngOnInit(): void {
    this.loadFormData();
    this.loadResources();
    this.loadMyResources();
  }

  // ==========================================
  // LOAD COUNTRIES
  // ==========================================

  loadFormData(): void {

    this.resourceService.getResourceFormData().subscribe({

      next: (response) => {
        this.countries.set(response.countries || []);
      },

      error: (error) => {
        console.error('Country loading error:', error);
      }

    });

  }

  // ==========================================
  // LOAD PUBLISHED RESOURCES
  // ==========================================

  loadResources(): void {

    this.isLoading.set(true);
    this.errorMessage.set('');

    const filters = {
      resource_type: this.selectedResourceType(),
      experience_level: this.selectedExperienceLevel(),
      country_id: this.selectedCountryId()
        ? Number(this.selectedCountryId())
        : undefined
    };

    this.resourceService.getCareerResources(filters).subscribe({

      next: (response) => {
        this.resources.set(response.resources || []);
        this.isLoading.set(false);
      },

      error: (error) => {
        console.error('Resource loading error:', error);

        this.errorMessage.set(
          error.error?.message || 'Failed to load resources.'
        );

        this.isLoading.set(false);
      }

    });

  }

  // ==========================================
  // LOAD MY RESOURCES
  // ==========================================

  loadMyResources(): void {

    this.isLoadingMyResources.set(true);

    this.resourceService.getMyResources().subscribe({

      next: (response) => {
        this.myResources.set(response.resources || []);
        this.isLoadingMyResources.set(false);
      },

      error: (error) => {
        console.error('My resources loading error:', error);
        this.isLoadingMyResources.set(false);
      }

    });

  }

  // ==========================================
  // APPLY FILTERS
  // ==========================================

  applyFilters(): void {
    this.loadResources();
  }

  // ==========================================
  // RESET FILTERS
  // ==========================================

  resetFilters(): void {

    this.selectedResourceType.set('');
    this.selectedExperienceLevel.set('');
    this.selectedCountryId.set('');

    this.loadResources();

  }

  // ==========================================
// DOWNLOAD RESOURCE PDF
// ==========================================

downloadResource(resourceId: number): void {

  this.resourceService.downloadResource(resourceId).subscribe({

    next: (blob) => {

      const fileUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');

      link.href = fileUrl;
      link.download = `career-resource-${resourceId}.pdf`;

      link.click();

      window.URL.revokeObjectURL(fileUrl);

    },

    error: (error) => {

      console.error('PDF download error:', error);

      this.errorMessage.set(
        error.error?.message || 'Failed to download PDF.'
      );

    }

  });

}


  // ==========================================
  // VIEW RESOURCE PDF
  // ==========================================

  viewResource(resourceId: number): void {

    if (this.isLoadingPreview()) return;

    this.closeResourcePreview();

    this.isLoadingPreview.set(true);
    this.previewError.set('');

    this.resourceService.downloadResource(resourceId).subscribe({

      next: (blob) => {

        if (blob.type !== 'application/pdf' && blob.size === 0) {
          this.isLoadingPreview.set(false);
          this.previewError.set('Invalid PDF document.');
          return;
        }

        this.previewObjectUrl = URL.createObjectURL(blob);

        this.previewUrl.set(
          this.sanitizer.bypassSecurityTrustResourceUrl(
            this.previewObjectUrl
          )
        );

        this.isLoadingPreview.set(false);

      },

      error: (error) => {

        console.error('PDF preview error:', error);

        this.isLoadingPreview.set(false);

        this.previewError.set(
          error.error?.message || 'Unable to open this PDF.'
        );

      }

    });

  }

  // ==========================================
  // CLOSE RESOURCE PREVIEW
  // ==========================================

  closeResourcePreview(): void {

    this.previewUrl.set(null);

    if (this.previewObjectUrl) {
      URL.revokeObjectURL(this.previewObjectUrl);
      this.previewObjectUrl = null;
    }

    this.isLoadingPreview.set(false);
    this.previewError.set('');

  }

  // ==========================================
  // COMPONENT CLEANUP
  // ==========================================

  ngOnDestroy(): void {
    this.closeResourcePreview();
  }


  // ==========================================
// ACTIVE TAB
// ==========================================

activeTab = signal<'library' | 'my-resources'>('library');

setActiveTab(tab: 'library' | 'my-resources'): void {
  this.activeTab.set(tab);
}

openUploadForm(): void {
  this.showUploadForm.set(true);
}

closeUploadForm(): void {
  this.showUploadForm.set(false);
  this.resetUploadForm();
}

onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  if (file.type !== 'application/pdf') {
    this.errorMessage.set('Only PDF files are allowed.');
    input.value = '';
    this.selectedFile.set(null);
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    this.errorMessage.set('PDF file size must not exceed 5 MB.');
    input.value = '';
    this.selectedFile.set(null);
    return;
  }

  this.errorMessage.set('');
  this.selectedFile.set(file);
}

resetUploadForm(): void {
  this.uploadTitle.set('');
  this.uploadResourceType.set('resume');
  this.uploadExperienceLevel.set('fresher');
  this.uploadCountryId.set('');
  this.uploadDescription.set('');
  this.selectedFile.set(null);
}


uploadResource(): void {

  // Validate required fields
  if (
    !this.uploadTitle().trim() ||
    !this.uploadCountryId() ||
    !this.selectedFile()
  ) {
    this.errorMessage.set(
      'Please complete all required fields and select a PDF.'
    );
    return;
  }

  // Prepare FormData
  const formData = new FormData();

  formData.append('resource_type', this.uploadResourceType());
  formData.append('title', this.uploadTitle().trim());
  formData.append('country_id', this.uploadCountryId());
  formData.append('experience_level', this.uploadExperienceLevel());
  formData.append('description', this.uploadDescription().trim());
  formData.append('document', this.selectedFile()!);

  this.isUploading.set(true);
  this.errorMessage.set('');
  this.successMessage.set('');

  // Upload original PDF
  this.resourceService.uploadResource(formData).subscribe({

    next: (response) => {

      this.isUploading.set(false);

      this.successMessage.set(
        response.message || 'Document uploaded successfully.'
      );

      console.log('Uploaded Resource ID:', response.resourceId);

      // Refresh My Uploads
      this.loadMyResources();

      // Close upload form
      this.closeUploadForm();

    },

    error: (error) => {

      this.isUploading.set(false);

      this.errorMessage.set(
        error.error?.message || 'Failed to upload document.'
      );

    }

  });

}

openPdfEditor(resourceId: number): void {
  this.selectedResourceId.set(resourceId);
}

closePdfEditor(): void {
  this.selectedResourceId.set(null);
}


}
