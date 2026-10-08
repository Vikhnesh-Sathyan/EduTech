import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

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

    this.save.emit({
      ...this.content
    });

  }

}