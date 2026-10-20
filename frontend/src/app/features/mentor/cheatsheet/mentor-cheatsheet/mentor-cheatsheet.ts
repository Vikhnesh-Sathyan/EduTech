
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TechnologyManagementComponent } from '../technology-management/technology-management';
import { CategoryManagementComponent } from '../category-management/category-management';
import { TopicManagementComponent } from '../topic-management/topic-management';
import { SubtopicManagementComponent } from '../subtopic-management/subtopic-management';

@Component({
  selector: 'app-mentor-cheatsheet',
  standalone: true,
  imports: [
    CommonModule,
    TechnologyManagementComponent,
    CategoryManagementComponent,
    TopicManagementComponent,
    SubtopicManagementComponent
  ],
  templateUrl: './mentor-cheatsheet.html',
  styleUrl: './mentor-cheatsheet.css'
})
export class MentorCheatsheetComponent {
  activeTab = signal<
    'technologies' | 'categories' | 'topics' | 'subtopics'
  >('technologies');

  setActiveTab(
    tab: 'technologies' | 'categories' | 'topics' | 'subtopics'
  ): void {
    this.activeTab.set(tab);
  }
}
