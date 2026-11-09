
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-grammar-corrections',
  imports: [],
  templateUrl: './grammar-corrections.html',
  styleUrl: './grammar-corrections.css'
})
export class GrammarCorrections {

  readonly corrections = input<string[]>([]);

}
