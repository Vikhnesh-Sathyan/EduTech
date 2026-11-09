
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-improvement-list',
  imports: [],
  templateUrl: './improvement-list.html',
  styleUrl: './improvement-list.css'
})
export class ImprovementList {

  readonly improvements = input<string[]>([]);

}
