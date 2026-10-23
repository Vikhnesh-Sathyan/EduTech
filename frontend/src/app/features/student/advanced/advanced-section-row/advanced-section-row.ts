import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-advanced-section-row',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './advanced-section-row.html',
  styleUrl: './advanced-section-row.css'
})
export class AdvancedSectionRow {
  @Input({ required: true }) sectionTitle = '';
  @Input() subtopicTitle = '';
  @Input() available = false;

  @Output() explore = new EventEmitter<void>();

  onExplore(): void {
    if (!this.available) return;
    this.explore.emit();
  }
}