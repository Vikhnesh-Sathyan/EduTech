import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-code-challenge',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './code-challenge.html',
  styleUrl: './code-challenge.css'
})
export class CodeChallenge {

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

    const problemStatement =
      this.content.problemStatement?.trim();

    const starterCode =
      this.content.starterCode?.trim();


    // Validate title
    if (!title) {

      this.toastService.error(
        'Please enter a title.'
      );

      return;
    }


    // Validate problem statement
    if (!problemStatement) {

      this.toastService.error(
        'Please enter a problem statement.'
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

      problemStatement,

      starterCode

    });

  }

}