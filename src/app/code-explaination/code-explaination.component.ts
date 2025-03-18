import { Component, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import * as Prism from 'prismjs';


@Component({
  selector: 'app-code-explaination',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './code-explaination.component.html',
  styleUrls: ['./code-explaination.component.css']
})
export class CodeExplainationComponent implements AfterViewInit {
  
    inputCode: string = ''; // Declare inputCode property
    convertedCode: string = ''; // Declare convertedCode property
    language: 'Python' | 'JavaScript' | 'Java' = 'Python'; // Track the selected language

    ngAfterViewInit(): void {
        // Highlight the code after the view initializes
        Prism.highlightAll();
    }

    // Method to convert code
    convertCode(inputCode: string): void {
        if (this.language === 'Python') {
            this.convertedCode = this.convertPythonToJavaScript(inputCode);
        } else if (this.language === 'JavaScript') {
            this.convertedCode = this.convertJavaScriptToPython(inputCode);
        } else {
            this.convertedCode = this.convertJavaToPython(inputCode);
        }
        setTimeout(() => {
            Prism.highlightAll(); // Highlight the code after conversion
        }, 0);
    }

    // Enhanced conversion from Python to JavaScript
    private convertPythonToJavaScript(inputCode: string): string {
        return inputCode
            .replace(/def\s+(\w+)\s*\((.*?)\):/g, 'function $1($2) {') // Function definition
            .replace(/print\((.*?)\)/g, 'console.log($1);') // Print statement
            .replace(/([a-zA-Z_]\w*)\s*=\s*(.*)/g, 'let $1 = $2;') // Variable assignment
            .replace(/if\s+(.*):/g, 'if ($1) {') // If statement
            .replace(/else:/g, '} else {') // Else statement
            .replace(/elif\s+(.*):/g, '} else if ($1) {') // Elif statement
            .replace(/for\s+(\w+)\s+in\s+(.*):/g, 'for (let $1 of $2) {') // For loop
            .replace(/while\s+(.*):/g, 'while ($1) {') // While loop
            .replace(/return\s+(.*)/g, 'return $1;') // Return statement
            .replace(/}/g, '}'); // Closing braces
    }

    // Enhanced conversion from JavaScript to Python
    private convertJavaScriptToPython(inputCode: string): string {
        return inputCode
            .replace(/function\s+(\w+)\s*\((.*?)\)\s*{/g, 'def $1($2):') // Function definition
            .replace(/console\.log\((.*?)\);/g, 'print($1)') // Console log
            .replace(/let\s+([a-zA-Z_]\w*)\s*=\s*(.*);/g, '$1 = $2') // Variable assignment
            .replace(/if\s*\((.*?)\)\s*{/g, 'if $1:') // If statement
            .replace(/else\s*{/g, 'else:') // Else statement
            .replace(/else if\s*\((.*?)\)\s*{/g, 'elif $1:') // Else if statement
            .replace(/for\s*\((.*?)\s+of\s+(.*?)\)\s*{/g, 'for $1 in $2:') // For loop
            .replace(/while\s*\((.*?)\)\s*{/g, 'while $1:') // While loop
            .replace(/return\s+(.*);/g, 'return $1') // Return statement
            .replace(/}/g, ''); // Remove closing braces
    }

    // Enhanced conversion from Java to Python
    private convertJavaToPython(inputCode: string): string {
        return inputCode
            .replace(/public\s+static\s+void\s+main\s*\(String\[\]\s+\w+\)\s*{/g, 'if __name__ == "__main__":') // Main method
            .replace(/System\.out\.println\((.*?)\);/g, 'print($1)') // Print statement
            .replace(/int\s+(\w+)\s*=\s*(.*);/g, '$1 = $2') // Integer assignment
            .replace(/if\s*\((.*?)\)\s*{/g, 'if $1:') // If statement
            .replace(/else\s*{/g, 'else:') // Else statement
            .replace(/for\s*\((.*?)\)\s*{/g, 'for $1:') // For loop
            .replace(/while\s*\((.*?)\)\s*{/g, 'while $1:') // While loop
            .replace(/return\s+(.*);/g, 'return $1') // Return statement
            .replace(/}/g, ''); // Remove closing braces
    }

    // Method to reset input and output fields
    resetFields(): void {
        this.inputCode = '';
        this.convertedCode = '';
    }

    // Method to download the converted code
    downloadConvertedCode(): void {
        const blob = new Blob([this.convertedCode], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted_code.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // Method to load example code snippets
 
}
