import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  StudentAdvancedSubjectGroup,
  StudentAdvancedSubjectSection
} from '../../../../services/student/advanced/student-advanced.service';

import { AdvancedSectionRow } from '../advanced-section-row/advanced-section-row';

@Component({
  selector: 'app-advanced-subject-card',
  standalone: true,
  imports: [CommonModule, AdvancedSectionRow],
  templateUrl: './advanced-subject-card.html',
  styleUrl: './advanced-subject-card.css'
})
export class AdvancedSubjectCard {
  @Input({ required: true }) subject!: StudentAdvancedSubjectGroup;
  @Input() expanded = false;

  @Output() toggle = new EventEmitter<number>();
  @Output() exploreSection =
    new EventEmitter<StudentAdvancedSubjectSection>();

  onToggle(): void {
    this.toggle.emit(this.subject.subjectId);
  }

  openSection(section: StudentAdvancedSubjectSection): void {
    if (!section.advancedUnlocked) return;
    this.exploreSection.emit(section);
  }
}