import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CoverletterService } from '../coverletter.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

interface CoverLetterVersion {
  id: number;
  content: string;
  timestamp: Date;
  confidence?: number;
}

@Component({
  selector: 'app-cover-letter',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './cover-letter.component.html',
  styleUrls: ['./cover-letter.component.css'],
  providers: [CoverletterService],
})
export class CoverLetterComponent {
  coverLetterForm: FormGroup;
  generatedCoverLetter: string = '';
  loading: boolean = false;
  isEditing: boolean = false;
  isPreviewMode: boolean = false;
  savedVersions: CoverLetterVersion[] = [];
  currentVersionId: number = 0;
  formProgress: number = 0;
  errorMessage: string = '';
  showError: boolean = false;

  constructor(
    private fb: FormBuilder,
    private coverletterService: CoverletterService
  ) {
    this.coverLetterForm = this.fb.group({
      name: ['', Validators.required],
      role: ['', Validators.required],
      experience: ['', [Validators.required, Validators.min(0)]],
      skills: ['', Validators.required],
      company: ['', Validators.required],
    });

    // Subscribe to form value changes to update progress
    this.coverLetterForm.valueChanges.subscribe(() => {
      this.updateFormProgress();
      this.hideError();
    });
  }

  updateFormProgress() {
    const totalFields = Object.keys(this.coverLetterForm.controls).length;
    const filledFields = Object.values(this.coverLetterForm.controls)
      .filter(control => control.value && control.valid).length;
    this.formProgress = (filledFields / totalFields) * 100;
  }

  get characterCount(): number {
    return this.generatedCoverLetter.length;
  }

  get wordCount(): number {
    return this.generatedCoverLetter.trim().split(/\s+/).length;
  }

  hideError() {
    this.showError = false;
    this.errorMessage = '';
  }

  showErrorMessage(message: string) {
    this.errorMessage = message;
    this.showError = true;
  }

  // Manually generate cover letter
  generateCoverLetter() {
    if (this.coverLetterForm.valid) {
      const { name, role, experience, skills, company } = this.coverLetterForm.value;

      this.generatedCoverLetter = `
Dear Hiring Manager at ${company},

I am excited to apply for the ${role} position at ${company}. With ${experience} years of experience, I have honed skills in ${skills}. I am confident that my expertise aligns with the position's requirements.

I look forward to discussing how I can contribute to ${company}'s success.

Sincerely,
${name}
      `.trim();

      this.saveVersion();
    } else {
      this.showErrorMessage('Please fill out all required fields.');
    }
  }

  saveVersion() {
    const newVersion: CoverLetterVersion = {
      id: this.currentVersionId++,
      content: this.generatedCoverLetter,
      timestamp: new Date()
    };
    this.savedVersions.push(newVersion);
  }

  loadVersion(version: CoverLetterVersion) {
    this.generatedCoverLetter = version.content;
    this.isEditing = false;
    this.isPreviewMode = false;
  }

  clearForm() {
    this.coverLetterForm.reset();
    this.generatedCoverLetter = '';
    this.isEditing = false;
    this.isPreviewMode = false;
    this.hideError();
  }

  togglePreviewMode() {
    this.isPreviewMode = !this.isPreviewMode;
  }


  // Toggle editing mode
  toggleEditing() {
    this.isEditing = !this.isEditing;
  }

  // Download cover letter as a .txt file
  downloadCoverLetter() {
    const blob = new Blob([this.generatedCoverLetter], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cover-letter.txt';
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
