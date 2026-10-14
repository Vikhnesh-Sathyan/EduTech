import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResourcesComponent } from './resources/resources';
import { DoubtsComponent } from './doubts/doubts';
import { InterviewPrepComponent } from './interview-prep/interview-prep';

type RecommendationSection =
  | 'resources'
  | 'doubts'
  | 'interview';

@Component({
  selector: 'app-recommendation',
  standalone: true,
  imports: [
    CommonModule,
    ResourcesComponent,
    DoubtsComponent,
    InterviewPrepComponent
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

  showInterviewPrep(): void {
    this.activeSection.set('interview');
  }
}
