
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './code-editor.html',
  styleUrl: './code-editor.css'
})
export class CodeEditor {

  @Input({ required: true })
  selectedLanguage = '';

  @Input()
  languageLabel = '';

  @Input()
  sourceCode = '';

  @Input()
  submitting = false;

  @Output()
  sourceCodeChange = new EventEmitter<string>();

  @Output()
  runRequested = new EventEmitter<void>();

}
