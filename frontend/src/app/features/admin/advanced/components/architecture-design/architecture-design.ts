import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

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