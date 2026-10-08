import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-mini-hands-on-coding',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './mini-hands-on-coding.html',
  styleUrl: './mini-hands-on-coding.css'
})
export class MiniHandsOnCoding {

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

    const task =
      this.content.task?.trim();

    const instructions =
      this.content.instructions?.trim();

    const starterCode =
      this.content.starterCode?.trim();


    // Validate title
    if (!title) {

      this.toastService.error(
        'Please enter a title.'
      );

      return;
    }


    // Validate task
    if (!task) {

      this.toastService.error(
        'Please enter the coding task.'
      );

      return;
    }


    // Validate instructions
    if (!instructions) {

      this.toastService.error(
        'Please provide the instructions.'
      );

      return;
    }


    // Validate starter code
    if (!starterCode) {

      this.toastService.error(
        'Please provide the starter code.'
      );

      return;
    }


    // Save only after validation passes
    this.save.emit({

      ...this.content,

      title,

      task,

      instructions,

      starterCode

    });

  }

}