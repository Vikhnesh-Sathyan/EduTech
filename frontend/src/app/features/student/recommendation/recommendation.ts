import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResourcesComponent } from './resources/resources';
import { DoubtsComponent } from './doubts/doubts';
import { InterviewPrepComponent } from './interview-prep/interview-prep';
import { CodingComponent } from './coding/coding';

type RecommendationSection =
  | 'resources'
  | 'doubts'
  | 'interview'
  | 'coding';

@Component({
  selector: 'app-recommendation',
  standalone: true,
  imports: [
    CommonModule,
    ResourcesComponent,
    DoubtsComponent,
    InterviewPrepComponent,
    CodingComponent
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

  showCoding(): void {
  this.activeSection.set('coding');
}
}
