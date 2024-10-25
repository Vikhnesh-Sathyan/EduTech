import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-code-editor',
  standalone:true,
  imports:[CommonModule,HttpClientModule,FormsModule],
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.css']
})
export class CodeEditorComponent {
  language: string = 'html'; // Default selected language
  code: string = '<h1>Hello, World!</h1>'; // Default code for demonstration

  @ViewChild('iframeOutput') iframeOutput!: ElementRef<HTMLIFrameElement>;

  // Method to run the code in the iframe
  runCode(): void {
    const iframe = this.iframeOutput.nativeElement;
    const iframeWindow = iframe.contentWindow || iframe.contentDocument?.defaultView;

    if (iframeWindow) {
      iframeWindow.document.open();
      iframeWindow.document.write(this.getCodeWithDoctype());
      iframeWindow.document.close();
    }
  }

  // Generates code with appropriate doctype
  private getCodeWithDoctype(): string {
    switch (this.language) {
      case 'html':
        return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Output</title></head><body>${this.code}</body></html>`;
      case 'css':
        return `<style>${this.code}</style>`;
      case 'javascript':
        return `<script>${this.code}</script>`;
      default:
        return '';
    }
  }
}
