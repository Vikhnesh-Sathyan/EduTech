import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-architecture-design',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './architecture-design.html',
  styleUrl: './architecture-design.css'
})
export class ArchitectureDesign {

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

    const problem =
      this.content.problem?.trim();

    const designApproach =
      this.content.designApproach?.trim();


    // Validate title
    if (!title) {

      this.toastService.error(
        'Please enter a title.'
      );

      return;
    }


    // Validate problem
    if (!problem) {

      this.toastService.error(
        'Please describe the problem.'
      );

      return;
    }


    // Validate design approach
    if (!designApproach) {

      this.toastService.error(
        'Please enter the design approach.'
      );

      return;
    }


    // Save only after validation passes
    this.save.emit({

      ...this.content,

      title,

      problem,

      designApproach

    });

  }

}