import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  StudentAdvancedSubjectGroup,
  StudentAdvancedSubjectSection
} from '../../../../services/student/advanced/student-advanced.service';

import { AdvancedSubjectCard } from '../advanced-subject-card/advanced-subject-card';

@Component({
  selector: 'app-advanced-subject-grid',
  standalone: true,
  imports: [CommonModule, AdvancedSubjectCard],
  templateUrl: './advanced-subject-grid.html',
  styleUrl: './advanced-subject-grid.css'
})
export class AdvancedSubjectGrid {
  @Input() subjects: StudentAdvancedSubjectGroup[] = [];
  @Input() expandedSubjectId: number | null = null;

  @Output() toggleSubject = new EventEmitter<number>();

  @Output() exploreSection =
    new EventEmitter<StudentAdvancedSubjectSection>();

  onToggleSubject(subjectId: number): void {
    this.toggleSubject.emit(subjectId);
  }

  onExploreSection(section: StudentAdvancedSubjectSection): void {
    this.exploreSection.emit(section);
  }
}