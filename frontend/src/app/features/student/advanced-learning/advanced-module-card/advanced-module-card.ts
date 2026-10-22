
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-advanced-module-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './advanced-module-card.html',
  styleUrl: './advanced-module-card.css'
})
export class AdvancedModuleCard {
  module = input.required<any>();
  index = input.required<number>();

  private readonly moduleTitles: Record<string, string> = {
    deep_dive: 'Deep Dive',
    behind_the_scenes: 'Behind the Scenes',
    concept_comparison: 'Concept Comparison',
    debugging: 'Debugging',
    real_world_scenario: 'Real-World Scenario',
    code_challenge: 'Code Challenge',
    mini_hands_on_coding: 'Mini Hands-on Coding',
    advanced_practice: 'Advanced Practice',
    architecture_design: 'Architecture Design',
    interview_challenge: 'Interview Challenge'
  };

  moduleTitle(moduleType: string): string {
    return this.moduleTitles[moduleType]
      || moduleType.replace(/_/g, ' ');
  }
}
