import { Component } from '@angular/core';
import { PendingResourcesComponent } from '../components/pending-resources/pending-resources';

@Component({
  selector: 'app-admin-resources',
  standalone: true,
  imports: [PendingResourcesComponent],
  templateUrl: './resources.html',
  styleUrl: './resources.css'
})
export class AdminResourcesComponent {}
