import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-advanced-practice',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './advanced-practice.html',
  styleUrl: './advanced-practice.css'
})
export class AdvancedPractice {

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


  updateOption(
    index: number,
    value: string
  ): void {

    const options = [
      ...(this.content.options || ['', '', '', ''])
    ];

    options[index] = value;

    this.contentChange.emit({
      ...this.content,
      options
    });

  }


  saveContent(): void {

    const title =
      this.content.title?.trim();

    const question =
      this.content.question?.trim();

    const options =
      this.content.options || [];

    const correctAnswer =
      this.content.correctAnswer?.trim();


    // Validate title
    if (!title) {

      this.toastService.error(
        'Please enter a title.'
      );

      return;
    }


    // Validate question
    if (!question) {

      this.toastService.error(
        'Please enter a question.'
      );

      return;
    }


    // Validate all 4 options
    if (options.length < 4) {

      this.toastService.error(
        'Please provide all 4 options.'
      );

      return;
    }


    const hasEmptyOption =
      options.some(
        (option: string) =>
          !option?.trim()
      );

    if (hasEmptyOption) {

      this.toastService.error(
        'Please fill in all 4 options.'
      );

      return;
    }


    // Validate correct answer
    if (!correctAnswer) {

      this.toastService.error(
        'Please select the correct answer.'
      );

      return;
    }


    // Save only after validation passes
    this.save.emit({

      ...this.content,

      title,

      question,

      options: options.map(
        (option: string) =>
          option.trim()
      ),

      correctAnswer

    });

  }

}