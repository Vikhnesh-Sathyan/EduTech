import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-deep-dive',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './deep-dive.html',
  styleUrl: './deep-dive.css'
})
export class DeepDive {

  @Input() content: any = {};

  @Input() saving = false;

  @Output() contentChange =
    new EventEmitter<any>();

  @Output() save =
    new EventEmitter<any>();

  constructor(
    private toastService: ToastService
  ) {}

  updateField(
    field: string,
    value: string
  ): void {

    this.contentChange.emit({
      ...this.content,
      [field]: value
    });

  }

  saveContent(): void {

    const title =
      this.content.title?.trim();

    const detailedExplanation =
      this.content.detailedExplanation?.trim();

    // Required field validation
    if (!title) {

      this.toastService.error(
        'Please enter a title.'
      );

      return;
    }

    if (!detailedExplanation) {

      this.toastService.error(
        'Please enter a detailed explanation.'
      );

      return;
    }

    // Save only after validation passes
    this.save.emit({
      ...this.content,
      title,
      detailedExplanation
    });

  }

}