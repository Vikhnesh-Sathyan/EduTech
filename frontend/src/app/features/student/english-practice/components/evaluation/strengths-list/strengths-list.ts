
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-strengths-list',
  imports: [],
  templateUrl: './strengths-list.html',
  styleUrl: './strengths-list.css'
})
export class StrengthsList {

  readonly strengths = input<string[]>([]);

}
