import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

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

    this.save.emit({
      ...this.content
    });

  }

}