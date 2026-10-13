import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Resource } from '../../../../../../services/student/resource.service';
import { ResourceCardComponent } from '../resource-card/resource-card';

@Component({
  selector: 'app-resource-list',
  standalone: true,
  imports: [
    CommonModule,
    ResourceCardComponent
  ],
  templateUrl: './resource-list.html',
  styleUrl: './resource-list.css'
})
export class ResourceListComponent {

  // Signal input receives resources from the parent component.
  resources = input<Resource[]>([]);

}
