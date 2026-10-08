import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

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