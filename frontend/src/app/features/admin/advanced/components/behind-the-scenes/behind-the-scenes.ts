import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-behind-the-scenes',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './behind-the-scenes.html',
  styleUrl: './behind-the-scenes.css'
})
export class BehindTheScenes {

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

    const whatHappensInternally =
      this.content.whatHappensInternally?.trim();


    // Validate title
    if (!title) {

      this.toastService.error(
        'Please enter a title.'
      );

      return;
    }


    // Validate internal explanation
    if (!whatHappensInternally) {

      this.toastService.error(
        'Please explain what happens internally.'
      );

      return;
    }


    // Save only after validation passes
    this.save.emit({

      ...this.content,

      title,

      whatHappensInternally

    });

  }

}