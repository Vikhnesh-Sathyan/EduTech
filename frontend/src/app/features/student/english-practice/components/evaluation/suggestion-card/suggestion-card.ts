
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-suggestion-card',
  imports: [],
  templateUrl: './suggestion-card.html',
  styleUrl: './suggestion-card.css'
})
export class SuggestionCard {

  readonly suggestion = input.required<string>();

}
