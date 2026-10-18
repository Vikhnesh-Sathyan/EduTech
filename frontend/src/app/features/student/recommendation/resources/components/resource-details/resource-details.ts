
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Resource } from '../../../../../../services/student/resource.service';

@Component({
  selector: 'app-resource-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resource-details.html',
  styleUrl: './resource-details.css'
})
export class ResourceDetailsComponent {
  resource = input.required<Resource>();

  back = output<void>();

  getResourceLink(): string | null {
    const url = this.resource().resource_url;

    if (!url) return null;

    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    return `http://localhost:5000/${url.replace(/^\/+/, '')}`;
  }
}
