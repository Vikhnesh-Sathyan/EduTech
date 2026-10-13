import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Resource } from '../../../../../services/student/resource.service';

@Component({
  selector: 'app-resource-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resource-card.html',
  styleUrl: './resource-card.css'
})
export class ResourceCardComponent {

  // Signal input: receives the resource from the parent component.
  resource = input.required<Resource>();

  // Return the readable label for the resource type.
  getResourceLabel(): string {
    const labels: Record<string, string> = {
      notes: 'Notes',
      pdf: 'PDF Document',
      video: 'Video',
      image: 'Image',
      study_tips: 'Study Tips'
    };

    return labels[this.resource().resource_type] ?? 'Resource';
  }

  // Return the icon for the resource type.
  getResourceIcon(): string {
    const icons: Record<string, string> = {
      notes: 'description',
      pdf: 'picture_as_pdf',
      video: 'play_circle',
      image: 'image',
      study_tips: 'lightbulb'
    };

    return icons[this.resource().resource_type] ?? 'menu_book';
  }

  // Return a complete URL for opening the resource.
  getResourceLink(): string | null {
    const url = this.resource().resource_url;

    if (!url) {
      return null;
    }

    // Keep external URLs unchanged.
    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    // Convert a backend upload path into a full URL.
    return `http://localhost:5000/${url.replace(/^\/+/, '')}`;
  }

  // Show a short preview of the description or resource content.
  getContentPreview(): string {
    const resource = this.resource();

    const content =
      resource.description ||
      resource.resource_content ||
      '';

    return content.length > 140
      ? `${content.substring(0, 140)}...`
      : content;
  }
}
