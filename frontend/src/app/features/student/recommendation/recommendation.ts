import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResourcesComponent } from './resources/resources';
import { DoubtsComponent } from './doubts/doubts';

type RecommendationSection = 'resources' | 'doubts';

@Component({
  selector: 'app-recommendation',
  standalone: true,
  imports: [
    CommonModule,
    ResourcesComponent,
    DoubtsComponent
  ],
  templateUrl: './recommendation.html',
  styleUrl: './recommendation.css'
})
export class RecommendationComponent {
  activeSection = signal<RecommendationSection>('resources');

  showResources(): void {
    this.activeSection.set('resources');
  }

  showDoubts(): void {
    this.activeSection.set('doubts');
  }
}