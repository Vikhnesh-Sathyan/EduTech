import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-debugging',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './debugging.html',
  styleUrl: './debugging.css'
})
export class Debugging {

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

    const problemDescription =
      this.content.problemDescription?.trim();

    const buggyCode =
      this.content.buggyCode?.trim();

    const correctCode =
      this.content.correctCode?.trim();


    // Validate title
    if (!title) {

      this.toastService.error(
        'Please enter a title.'
      );

      return;
    }


    // Validate problem description
    if (!problemDescription) {

      this.toastService.error(
        'Please describe the problem.'
      );

      return;
    }


    // Validate buggy code
    if (!buggyCode) {

      this.toastService.error(
        'Please provide the buggy code.'
      );

      return;
    }


    // Validate correct code
    if (!correctCode) {

      this.toastService.error(
        'Please provide the correct code.'
      );

      return;
    }


    // Save only after validation passes
    this.save.emit({

      ...this.content,

      title,

      problemDescription,

      buggyCode,

      correctCode

    });

  }

}