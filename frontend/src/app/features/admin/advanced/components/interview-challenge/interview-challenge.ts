import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-interview-challenge',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './interview-challenge.html',
  styleUrl: './interview-challenge.css'
})
export class InterviewChallenge {

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

    const interviewQuestion =
      this.content.interviewQuestion?.trim();

    const strongAnswer =
      this.content.strongAnswer?.trim();


    // Validate title
    if (!title) {

      this.toastService.error(
        'Please enter a title.'
      );

      return;
    }


    // Validate interview question
    if (!interviewQuestion) {

      this.toastService.error(
        'Please enter the interview question.'
      );

      return;
    }


    // Validate strong answer
    if (!strongAnswer) {

      this.toastService.error(
        'Please provide a strong answer.'
      );

      return;
    }


    // Save only after validation passes
    this.save.emit({

      ...this.content,

      title,

      interviewQuestion,

      strongAnswer

    });

  }

}