import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-comparison-concept-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comparison-concept-form.html',
  styleUrl: './comparison-concept-form.css'
})
export class ComparisonConceptFormComponent {
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() initialName = '';
  @Input() saving = false;

  @Output() save = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  conceptName = '';
  errorMessage = '';

  ngOnInit(): void {
    this.conceptName = this.initialName;
  }

  submitForm(): void {
    const name = this.conceptName.trim();

    if (!name) {
      this.errorMessage = 'Please enter a concept name.';
      return;
    }

    if (name.length > 150) {
      this.errorMessage = 'Concept name cannot exceed 150 characters.';
      return;
    }

    this.errorMessage = '';
    this.save.emit(name);
  }

  onNameChange(): void {
    this.errorMessage = '';
  }

  closeForm(): void {
    if (this.saving) return;
    this.cancel.emit();
  }
}