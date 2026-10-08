import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-concept-comparison',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './concept-comparison.html',
  styleUrl: './concept-comparison.css'
})
export class ConceptComparison {

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

    const conceptA =
      this.content.conceptA?.trim();

    const conceptB =
      this.content.conceptB?.trim();


    // Validate title
    if (!title) {

      this.toastService.error(
        'Please enter a title.'
      );

      return;
    }


    // Validate Concept A
    if (!conceptA) {

      this.toastService.error(
        'Please enter Concept A.'
      );

      return;
    }


    // Validate Concept B
    if (!conceptB) {

      this.toastService.error(
        'Please enter Concept B.'
      );

      return;
    }


    // Save only after validation passes
    this.save.emit({

      ...this.content,

      title,

      conceptA,

      conceptB

    });

  }

}